<template>
  <v-app>
    <v-main class="bg-slate-950 text-slate-100">
      <div class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_32%),linear-gradient(180deg,_#020617_0%,_#111827_55%,_#020617_100%)]">
        <div class="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16 sm:px-10 lg:px-12">
          <div class="grid w-full gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <section class="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-emerald-950/20 backdrop-blur md:p-10">
              <p class="mb-4 inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
                Clean starter
              </p>
              <h1 class="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Vue, Tailwind CSS, Vuetify i Orval w czystym projekcie bez SCSS.
              </h1>
              <p class="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Ten starter zostawia tylko nowy foundation: utility classes z Tailwinda,
                komponenty Vuetify i typowany klient API generowany przez Orval.
              </p>

              <div class="mt-8 flex flex-wrap gap-3">
                <span class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">Tailwind v4</span>
                <span class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">Vuetify 3</span>
                <span class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">Orval</span>
                <span class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">TypeScript</span>
              </div>

              <div class="mt-10 grid gap-4 sm:grid-cols-3">
                <article class="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                  <p class="text-sm font-medium text-slate-400">UI</p>
                  <p class="mt-2 text-lg font-semibold text-white">Vuetify gotowy</p>
                </article>
                <article class="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                  <p class="text-sm font-medium text-slate-400">Styling</p>
                  <p class="mt-2 text-lg font-semibold text-white">Zero SCSS</p>
                </article>
                <article class="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                  <p class="text-sm font-medium text-slate-400">API</p>
                  <p class="mt-2 text-lg font-semibold text-white">Orval skonfigurowany</p>
                </article>
              </div>
            </section>

            <section class="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur md:p-8">
              <v-card rounded="xl" color="transparent" variant="flat" class="border border-white/10 bg-white/5">
                <v-card-item>
                  <template #prepend>
                    <v-avatar color="emerald-darken-2" icon="mdi-api" />
                  </template>
                  <v-card-title>Orval demo</v-card-title>
                  <v-card-subtitle>Generator jest podpiety pod Swagger URL z env.</v-card-subtitle>
                </v-card-item>

                <v-card-text class="space-y-4">
                  <v-alert
                    :type="healthState.type"
                    variant="tonal"
                    border="start"
                    density="comfortable"
                    :text="healthState.message"
                  />

                  <div class="flex flex-wrap gap-3">
                    <v-chip color="emerald" variant="flat" prepend-icon="mdi-link-variant">
                      {{ swaggerUrl }}
                    </v-chip>
                  </div>
                </v-card-text>
              </v-card>
            </section>
          </div>
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const swaggerUrl = import.meta.env.VITE_ORVAL_SWAGGER_URL ?? 'http://localhost:4000/swagger/v1/swagger.json'
const apiMessage = ref('Uruchom `npm run orval`, aby wygenerowac klienta z aktualnego Swaggera.')
const apiStatus = ref<'info' | 'success' | 'error'>('info')

const healthState = computed(() => ({
  type: apiStatus.value,
  message: apiMessage.value,
}))
</script>
