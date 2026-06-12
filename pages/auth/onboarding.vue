<template>
  <section class="onboarding">
    <div class="onboarding__grain" aria-hidden="true"></div>
    <div class="onboarding__leaf onboarding__leaf--a" aria-hidden="true"></div>
    <div class="onboarding__leaf onboarding__leaf--b" aria-hidden="true"></div>

    <div class="onboarding__shell">
      <!-- Header -->
      <header class="onboarding__head">
        <p class="onboarding__eyebrow">
          <span class="onboarding__dot"></span>
          Personalisasi · {{ steps[step].kicker }} / 03
        </p>
        <h1 class="onboarding__title">
          <template v-if="step === 0">Apa yang biasa kamu<br /><em>masukkan keranjang?</em></template>
          <template v-else-if="step === 1">Ada <em>brand</em> yang<br />jadi langganan?</template>
          <template v-else>Berapa <em>anggaran</em><br />belanja idealmu?</template>

        </h1>
        <p class="onboarding__sub">
          <template v-if="step === 0">Pilih beberapa kategori favoritmu. Kami pakai ini untuk meracik rekomendasi pertamamu.</template>
          <template v-else-if="step === 1">Opsional, tapi membantu kami menajamkan pilihan. Lewati kalau belum ada.</template>
          <template v-else>Bantu kami menampilkan produk di rentang harga yang pas buatmu.</template>
        </p>
      </header>

      <!-- Progress -->
      <div class="onboarding__progress" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100">
        <div class="onboarding__progress-track">
          <div class="onboarding__progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <ul class="onboarding__steps">
          <li
            v-for="(s, i) in steps"
            :key="s.key"
            :class="['onboarding__step', { 'is-active': i === step, 'is-done': i < step }]"
          >
            {{ s.label }}
          </li>
        </ul>
      </div>

      <!-- Loading -->
      <div v-if="preferenceStore.loading" class="onboarding__loading">
        <span class="onboarding__spinner"></span>
        Menyiapkan pilihan…
      </div>

      <!-- Panels -->
      <div v-else class="onboarding__panel">
        <!-- Step 0: categories -->
        <div v-if="step === 0" class="onboarding__chips" :key="'cat'">
          <button
            v-for="(c, i) in preferenceStore.categories"
            :key="c.id"
            type="button"
            class="chip"
            :class="{ 'chip--on': isSelected('category', c.name) }"
            :style="{ '--i': i }"
            :aria-pressed="isSelected('category', c.name)"
            @click="toggle('category', c.name)"
          >
            <span class="chip__check"><i class="ti ti-check"></i></span>
            <span class="chip__label">{{ c.name }}</span>
          </button>
          <p v-if="!preferenceStore.categories.length" class="onboarding__empty">
            Belum ada kategori tersedia.
          </p>
        </div>

        <!-- Step 1: brands -->
        <div v-else-if="step === 1" class="onboarding__chips" :key="'brand'">
          <button
            v-for="(b, i) in preferenceStore.brands"
            :key="b.id"
            type="button"
            class="chip"
            :class="{ 'chip--on': isSelected('brand', b.name) }"
            :style="{ '--i': i }"
            :aria-pressed="isSelected('brand', b.name)"
            @click="toggle('brand', b.name)"
          >
            <span class="chip__check"><i class="ti ti-check"></i></span>
            <span class="chip__label">{{ b.name }}</span>
          </button>
          <p v-if="!preferenceStore.brands.length" class="onboarding__empty">
            Belum ada brand tersedia. Lanjut saja ke langkah berikutnya.
          </p>
        </div>

        <!-- Step 2: budget -->
        <div v-else class="onboarding__budget" :key="'budget'">
          <button
            v-for="(opt, i) in budgetOptions"
            :key="opt.label"
            type="button"
            class="budget"
            :class="{ 'budget--on': selectedBudget && selectedBudget.label === opt.label }"
            :style="{ '--i': i }"
            :aria-pressed="selectedBudget && selectedBudget.label === opt.label"
            @click="selectedBudget = opt"
          >
            <span class="budget__label">{{ opt.label }}</span>
            <span class="budget__hint">{{ opt.hint }}</span>
          </button>
        </div>
      </div>

      <!-- Error -->
      <p v-if="preferenceStore.error" class="onboarding__error">{{ preferenceStore.error }}</p>

      <!-- Footer actions -->
      <footer class="onboarding__foot">
        <button
          v-if="step > 0"
          type="button"
          class="btn-ghost"
          @click="back"
        >
          <i class="ti ti-arrow-left"></i> Kembali
        </button>
        <button v-else type="button" class="btn-ghost" @click="skip">
          Lewati untuk sekarang
        </button>

        <div class="onboarding__foot-right">
          <span class="onboarding__count">
            <template v-if="step === 0">{{ selectedCategoryCount }} dipilih</template>
            <template v-else-if="step === 1">{{ selectedBrandCount }} dipilih</template>
          </span>
          <button
            type="button"
            class="btn-solid"
            :disabled="!canContinue || preferenceStore.saving"
            @click="next"
          >
            <span v-if="preferenceStore.saving">Menyimpan…</span>
            <span v-else-if="step < steps.length - 1">Lanjut <i class="ti ti-arrow-right"></i></span>
            <span v-else>Mulai belanja <i class="ti ti-sparkles"></i></span>
          </button>
        </div>
      </footer>
    </div>
  </section>

</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { usePreferenceStore } from '~/stores/preference'

definePageMeta({ layout: 'auth' })

const router = useRouter()
const authStore = useAuthStore()
const preferenceStore = usePreferenceStore()

// ── Steps ──────────────────────────────────────────────
// 0: categories, 1: brands, 2: budget
const step = ref(0)
const steps = [
  { key: 'category', label: 'Kategori', kicker: '01' },
  { key: 'brand', label: 'Brand', kicker: '02' },
  { key: 'budget', label: 'Anggaran', kicker: '03' },
]

const selected = reactive({
  categories: new Set(),
  brands: new Set(),
})

// Budget presets (in IDR). value = [min, max]; max 0 = "no upper bound".
const budgetOptions = [
  { label: 'Hemat', hint: '< 50rb', value: [0, 50000] },
  { label: 'Menengah', hint: '50rb – 250rb', value: [50000, 250000] },
  { label: 'Premium', hint: '250rb – 1jt', value: [250000, 1000000] },
  { label: 'Tanpa batas', hint: 'Apa saja', value: [0, 0] },
]
const selectedBudget = ref(null)

const progress = computed(() => Math.round(((step.value + 1) / steps.length) * 100))

const selectedCategoryCount = computed(() => selected.categories.size)
const selectedBrandCount = computed(() => selected.brands.size)

function toggle(kind, name) {
  const set = kind === 'category' ? selected.categories : selected.brands
  if (set.has(name)) {
    set.delete(name)
  } else {
    set.add(name)
  }
}

function isSelected(kind, name) {
  const set = kind === 'category' ? selected.categories : selected.brands
  return set.has(name)
}

function next() {
  if (step.value < steps.length - 1) {
    step.value += 1
  } else {
    submit()
  }
}

function back() {
  if (step.value > 0) step.value -= 1
}

const canContinue = computed(() => {
  if (step.value === 0) return selectedCategoryCount.value > 0
  if (step.value === 1) return true // brands optional
  return true
})

async function submit() {
  const [min, max] = selectedBudget.value ? selectedBudget.value.value : [0, 0]
  try {
    await preferenceStore.savePreference({
      preferred_categories: Array.from(selected.categories),
      preferred_brands: Array.from(selected.brands),
      price_min: min,
      price_max: max,
    })
    router.push('/')
  } catch (err) {
    console.error('Save preference error:', err)
  }
}

function skip() {
  router.push('/')
}

onMounted(async () => {
  authStore.checkAuth()
  if (!authStore.token) {
    router.replace('/auth/signin')
    return
  }
  await preferenceStore.fetchOptions()
})
</script>


<style scoped>
/* ── Organic / natural, soft & airy. Green-led on warm off-white. ── */
.onboarding {
  --green: #2f7d3b;
  --green-deep: #1f5a2a;
  --green-soft: #e7f1e3;
  --cream: #f6f4ec;
  --ink: #243027;
  --muted: #6c7a6e;
  --line: #dcdfd2;

  position: relative;
  min-height: calc(100vh - 140px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.25rem 4rem;
  background:
    radial-gradient(120% 90% at 12% 0%, #eef4e7 0%, rgba(238, 244, 231, 0) 55%),
    radial-gradient(100% 80% at 100% 100%, #eaf2ea 0%, rgba(234, 242, 234, 0) 50%),
    var(--cream);
  color: var(--ink);
  overflow: hidden;
}

/* Subtle film grain for crafted texture */
.onboarding__grain {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* Decorative organic blobs */
.onboarding__leaf {
  position: absolute;
  border-radius: 46% 54% 60% 40% / 52% 44% 56% 48%;
  filter: blur(2px);
  pointer-events: none;
}
.onboarding__leaf--a {
  width: 320px; height: 320px;
  top: -90px; right: -80px;
  background: radial-gradient(circle at 30% 30%, rgba(47,125,59,0.18), rgba(47,125,59,0) 70%);
}
.onboarding__leaf--b {
  width: 260px; height: 260px;
  bottom: -70px; left: -70px;
  background: radial-gradient(circle at 60% 40%, rgba(160,196,108,0.22), rgba(160,196,108,0) 70%);
}

.onboarding__shell {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 720px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(220, 223, 210, 0.9);
  border-radius: 28px;
  padding: 2.25rem 2rem 1.75rem;
  box-shadow:
    0 1px 0 rgba(255,255,255,0.8) inset,
    0 30px 60px -30px rgba(31, 90, 42, 0.28);
  animation: shell-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes shell-in {
  from { opacity: 0; transform: translateY(16px) scale(0.99); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Header */
.onboarding__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--green);
  margin: 0 0 0.85rem;
}
.onboarding__dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 0 4px rgba(47,125,59,0.15);
}
.onboarding__title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(1.9rem, 4.5vw, 2.85rem);
  line-height: 1.04;
  letter-spacing: -0.01em;
  font-weight: 600;
  margin: 0 0 0.75rem;
}
.onboarding__title em {
  font-style: italic;
  color: var(--green-deep);
}
.onboarding__sub {
  font-size: 0.98rem;
  color: var(--muted);
  max-width: 46ch;
  margin: 0;
}

/* Progress */
.onboarding__progress { margin: 1.6rem 0 1.4rem; }
.onboarding__progress-track {
  height: 5px;
  background: var(--green-soft);
  border-radius: 999px;
  overflow: hidden;
}
.onboarding__progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--green), #6fae54);
  transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.onboarding__steps {
  display: flex;
  gap: 1.25rem;
  list-style: none;
  padding: 0;
  margin: 0.7rem 0 0;
}
.onboarding__step {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--muted);
  opacity: 0.6;
  transition: opacity 0.3s ease, color 0.3s ease;
}
.onboarding__step.is-active { opacity: 1; color: var(--green-deep); }
.onboarding__step.is-done { opacity: 1; color: var(--green); }

/* Loading */
.onboarding__loading {
  display: flex; align-items: center; gap: 0.6rem;
  color: var(--muted); padding: 2.5rem 0; font-size: 0.95rem;
}
.onboarding__spinner {
  width: 18px; height: 18px; border-radius: 50%;
  border: 2px solid var(--green-soft);
  border-top-color: var(--green);
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Panel */
.onboarding__panel { min-height: 220px; }

/* Chips */
.onboarding__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  padding: 0.35rem 0 0.5rem;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.6rem 1rem;
  border-radius: 999px;
  border: 1.5px solid var(--line);
  background: #fff;
  color: var(--ink);
  font-size: 0.92rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1),
              border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  animation: chip-in 0.42s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(var(--i) * 22ms);
}
@keyframes chip-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.chip:hover { border-color: #b9cdab; transform: translateY(-1px); }
.chip:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px rgba(47,125,59,0.22);
}
.chip__check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 0;
  height: 18px;
  overflow: hidden;
  opacity: 0;
  color: #fff;
  transition: width 0.2s ease, opacity 0.2s ease;
}
.chip--on {
  background: var(--green);
  border-color: var(--green);
  color: #fff;
  box-shadow: 0 8px 18px -8px rgba(47,125,59,0.7);
  transform: translateY(-1px) scale(1.02);
}
.chip--on .chip__check { width: 18px; opacity: 1; }

/* Budget cards */
.onboarding__budget {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  padding-top: 0.35rem;
}
.budget {
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1.1rem 1.15rem;
  border-radius: 18px;
  border: 1.5px solid var(--line);
  background: #fff;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
              border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  animation: chip-in 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(var(--i) * 50ms);
}
.budget:hover { border-color: #b9cdab; transform: translateY(-2px); }
.budget:focus-visible { outline: none; box-shadow: 0 0 0 4px rgba(47,125,59,0.22); }
.budget__label { font-size: 1.05rem; font-weight: 600; color: var(--ink); }
.budget__hint { font-size: 0.85rem; color: var(--muted); }
.budget--on {
  border-color: var(--green);
  background: var(--green-soft);
  box-shadow: 0 12px 26px -16px rgba(31,90,42,0.6);
}
.budget--on .budget__label { color: var(--green-deep); }

.onboarding__empty { color: var(--muted); font-size: 0.92rem; padding: 1rem 0; }
.onboarding__error {
  color: #b3261e;
  background: #fbe9e7;
  border-radius: 12px;
  padding: 0.7rem 0.9rem;
  font-size: 0.88rem;
  margin: 1rem 0 0;
}

/* Footer */
.onboarding__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.6rem;
  padding-top: 1.25rem;
  border-top: 1px dashed var(--line);
}
.onboarding__foot-right {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}
.onboarding__count { font-size: 0.82rem; color: var(--muted); }

.btn-ghost {
  background: transparent;
  border: none;
  color: var(--muted);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.55rem 0.4rem;
  border-radius: 10px;
  transition: color 0.2s ease;
}
.btn-ghost:hover { color: var(--green-deep); }
.btn-ghost:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(47,125,59,0.2); }

.btn-solid {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: var(--green);
  color: #fff;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.7rem 1.4rem;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 14px 26px -12px rgba(31,90,42,0.65);
  transition: transform 0.18s ease, background 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}
.btn-solid:hover:not(:disabled) { background: var(--green-deep); transform: translateY(-1px); }
.btn-solid:focus-visible { outline: none; box-shadow: 0 0 0 4px rgba(47,125,59,0.3); }
.btn-solid:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }

@media (max-width: 560px) {
  .onboarding__shell { padding: 1.6rem 1.25rem 1.4rem; border-radius: 22px; }
  .onboarding__budget { grid-template-columns: 1fr; }
  .onboarding__foot { flex-direction: column-reverse; align-items: stretch; }
  .onboarding__foot-right { justify-content: space-between; }
  .btn-solid { justify-content: center; }
}

@media (prefers-reduced-motion: reduce) {
  .onboarding__shell,
  .chip,
  .budget { animation: none; }
  .chip,
  .budget,
  .onboarding__progress-fill,
  .btn-solid { transition: none; }
}
</style>

