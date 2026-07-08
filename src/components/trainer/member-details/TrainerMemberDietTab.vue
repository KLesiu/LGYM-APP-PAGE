<template>
  <div class="flex min-h-0 min-w-0 flex-col gap-4">
    <section class="flex flex-col gap-4">
      <div class="flex flex-col gap-4 rounded-[28px] border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] px-5 py-6 sm:px-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lgym-primary)]">
              {{ t("trainerMemberDetails.diet.eyebrow") }}
            </p>
            <h2 class="mt-2 text-2xl font-semibold text-[var(--lgym-text)] sm:text-3xl">
              {{ t("trainerMemberDetails.diet.title") }}
            </h2>
            <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)"]>{{ plansCountLabel }}</p>
          </div>

          <div class="flex flex-wrap gap-2">
            <v-btn color="primary" class="min-h-10 rounded-md px-4" @click="openCreateDialog">
              {{ t("trainerMemberDetails.diet.actions.create") }}
            </v-btn>
            <v-btn
              v-if="activePlans.length === 1"
              variant="outlined"
              color="primary"
              class="min-h-10 rounded-md px-4"
              @click="openEditDialog(activePlans[0])"
            >
              {{ t("trainerMemberDetails.diet.actions.editActive") }}
            </v-btn>
          </div>
        </div>

        <p class="max-w-3xl text-sm leading-6 text-[var(--lgym-text-muted)]">
          {{ t("trainerMemberDetails.diet.subtitle") }}
        </p>
      </div>

      <div v-if="activePlans.length > 1" class="rounded-xl bg-[var(--lgym-note-bg)] px-4 py-3 text-sm text-[var(--lgym-text-muted)]">
        {{ t("trainerMemberDetails.diet.summary.activeCount", { count: activePlans.length }) }}
      </div>

      <v-progress-linear v-if="isLoading" indeterminate color="primary" />

      <div v-if="hasError && !isLoading" class="rounded-md border border-dashed border-[var(--lgym-border)] px-6 py-10 text-center">
        <p class="text-sm text-[var(--lgym-text-muted)]">
          {{ t("trainerMemberDetails.diet.error") }}
        </p>
        <v-btn class="mt-4" color="primary" variant="outlined" @click="loadPlans">
          {{ t("trainerMemberDetails.actions.retry") }}
        </v-btn>
      </div>

      <div v-else-if="plans.length === 0 && !isLoading" class="rounded-md border border-dashed border-[var(--lgym-border)] px-6 py-10 text-center">
        <p class="text-base font-semibold text-[var(--lgym-text)]">
          {{ t("trainerMemberDetails.diet.empty.title") }}
        </p>
        <p class="mt-2 text-sm text-[var(--lgym-text-muted)]">
          {{ t("trainerMemberDetails.diet.empty.subtitle") }}
        </p>
      </div>

      <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="plan in sortedPlans"
          :key="plan._id || plan.name || 'diet'"
          class="group cursor-pointer overflow-hidden rounded-[28px] border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)] transition hover:-translate-y-0.5 hover:border-[var(--lgym-primary)]/50"
          @click="openPlanPreview(plan)"
        >
          <div class="flex h-full flex-col gap-4 px-5 py-5 sm:px-6">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-start gap-3">
                <h3 class="flex-1 text-lg font-semibold text-[var(--lgym-text)]">
                  {{ plan.name || t("trainerMemberDetails.diet.fallback.noName") }}
                </h3>
                <v-chip :color="plan.isActive ? 'success' : 'secondary'" size="small" variant="outlined">
                  {{ plan.isActive ? t("trainerMemberDetails.diet.badges.active") : t("trainerMemberDetails.diet.badges.inactive") }}
                </v-chip>
              </div>
              <p class="mt-2 text-sm text-[var(--lgym-text-muted)]">
                {{ t("trainerMemberDetails.diet.meta.dateRange", { start: plan.startDate || '—', end: plan.endDate || t('trainerMemberDetails.diet.meta.noEndDate') }) }}
              </p>
              <p class="mt-1 text-xs text-[var(--lgym-text-soft)]">
                {{ t("trainerMemberDetails.diet.meta.mealCount", { count: plan.meals?.length ?? 0 }) }}
              </p>
              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <div class="rounded-2xl bg-[var(--lgym-note-bg)] p-3 text-sm">
                  <span class="text-[var(--lgym-text-muted)]">{{ t("trainerMemberDetails.diet.macros.calories") }}</span>
                  <p class="mt-1 font-semibold text-[var(--lgym-text)]">{{ formatOptional(plan.estimatedCalories) }}</p>
                </div>
                <div class="rounded-2xl bg-[var(--lgym-note-bg)] p-3 text-sm">
                  <span class="text-[var(--lgym-text-muted)]">{{ t("trainerMemberDetails.diet.meta.mealCount", { count: plan.meals?.length ?? 0 }) }}</span>
                  <p class="mt-1 font-semibold text-[var(--lgym-text)]">{{ plan.meals?.length ?? 0 }}</p>
                </div>
              </div>
              <p class="diet-card-preview mt-4 whitespace-pre-line text-sm leading-7 text-[var(--lgym-text-muted)]">
                {{ getDietPreview(plan) }}
              </p>
            </div>

            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lgym-primary)]">Open diet</p>
          </div>
        </article>
      </div>
    </section>

    <v-dialog v-model="isPreviewOpen" max-width="1080">
      <v-card rounded="lg" class="border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]">
        <template v-if="selectedPreviewPlan">
          <div class="border-b border-[var(--lgym-border)] px-6 py-5">
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0 flex-1">
                <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lgym-primary)]">
                  {{ t("trainerMemberDetails.diet.eyebrow") }}
                </p>
                <h3 class="mt-2 text-2xl font-semibold text-[var(--lgym-text)]">
                  {{ selectedPreviewPlan.name || t("trainerMemberDetails.diet.fallback.noName") }}
                </h3>
                <p class="mt-2 text-sm text-[var(--lgym-text-muted)]">
                  {{ t("trainerMemberDetails.diet.meta.dateRange", { start: selectedPreviewPlan.startDate || '—', end: selectedPreviewPlan.endDate || t('trainerMemberDetails.diet.meta.noEndDate') }) }}
                </p>
              </div>

              <v-btn icon="mdi-close" variant="text" @click="closePlanPreview" />
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <v-chip :color="selectedPreviewPlan.isActive ? 'success' : 'secondary'" size="small" variant="outlined">
                {{ selectedPreviewPlan.isActive ? t("trainerMemberDetails.diet.badges.active") : t("trainerMemberDetails.diet.badges.inactive") }}
              </v-chip>
            </div>
          </div>

          <v-card-text class="px-6 py-6">
            <div class="grid gap-5">
              <div class="grid gap-3 md:grid-cols-4">
                <div class="rounded-2xl bg-[var(--lgym-note-bg)] p-4 text-sm">
                  <span class="text-[var(--lgym-text-muted)]">{{ t("trainerMemberDetails.diet.macros.calories") }}</span>
                  <p class="mt-1 font-semibold text-[var(--lgym-text)]">{{ formatOptional(selectedPreviewPlan.estimatedCalories) }}</p>
                </div>
                <div class="rounded-2xl bg-[var(--lgym-note-bg)] p-4 text-sm">
                  <span class="text-[var(--lgym-text-muted)]">{{ t("trainerMemberDetails.diet.macros.protein") }}</span>
                  <p class="mt-1 font-semibold text-[var(--lgym-text)]">{{ formatOptional(selectedPreviewPlan.proteinGrams) }}</p>
                </div>
                <div class="rounded-2xl bg-[var(--lgym-note-bg)] p-4 text-sm">
                  <span class="text-[var(--lgym-text-muted)]">{{ t("trainerMemberDetails.diet.macros.carbs") }}</span>
                  <p class="mt-1 font-semibold text-[var(--lgym-text)]">{{ formatOptional(selectedPreviewPlan.carbsGrams) }}</p>
                </div>
                <div class="rounded-2xl bg-[var(--lgym-note-bg)] p-4 text-sm">
                  <span class="text-[var(--lgym-text-muted)]">{{ t("trainerMemberDetails.diet.macros.fat") }}</span>
                  <p class="mt-1 font-semibold text-[var(--lgym-text)]">{{ formatOptional(selectedPreviewPlan.fatGrams) }}</p>
                </div>
              </div>

              <div v-if="selectedPreviewPlan.notes" class="rounded-3xl border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] px-5 py-5">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                  {{ t("trainerMemberDetails.diet.form.notes") }}
                </p>
                <p class="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--lgym-text-muted)]">
                  {{ selectedPreviewPlan.notes }}
                </p>
              </div>

              <div class="rounded-2xl bg-[var(--lgym-note-bg)] px-4 py-4 sm:px-5">
                <p class="text-sm font-semibold text-[var(--lgym-text)]">{{ t("trainerMemberDetails.diet.meals.title") }}</p>
                <div class="mt-3 overflow-x-auto">
                  <div class="min-w-[760px]">
                    <div class="grid grid-cols-[minmax(220px,2fr)_88px_88px_88px_88px_56px] gap-3 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--lgym-text-soft)]">
                      <span>{{ t("trainerMemberDetails.diet.form.mealName") }}</span>
                      <span class="text-right">{{ t("trainerMemberDetails.diet.macros.calories") }}</span>
                      <span class="text-right">{{ t("trainerMemberDetails.diet.macros.protein") }}</span>
                      <span class="text-right">{{ t("trainerMemberDetails.diet.macros.fat") }}</span>
                      <span class="text-right">{{ t("trainerMemberDetails.diet.macros.carbs") }}</span>
                      <span class="text-right">#</span>
                    </div>
                    <div class="grid gap-2">
                      <div v-for="meal in sortMeals(selectedPreviewPlan.meals)" :key="meal._id || `${meal.name}-${meal.order}`" class="rounded-xl border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] px-4 py-3">
                        <div class="grid grid-cols-[minmax(220px,2fr)_88px_88px_88px_88px_56px] items-start gap-3 text-sm">
                          <div>
                            <p class="font-semibold text-[var(--lgym-text)]">{{ meal.name || t("trainerMemberDetails.diet.meals.fallback") }}</p>
                            <p v-if="meal.description" class="mt-1 text-xs leading-5 text-[var(--lgym-text-muted)]">{{ meal.description }}</p>
                          </div>
                          <p class="text-right font-semibold text-[var(--lgym-text)]">{{ formatOptional(meal.estimatedCalories) }}</p>
                          <p class="text-right font-semibold text-[var(--lgym-text)]">{{ formatOptional(meal.proteinGrams) }}</p>
                          <p class="text-right font-semibold text-[var(--lgym-text)]">{{ formatOptional(meal.fatGrams) }}</p>
                          <p class="text-right font-semibold text-[var(--lgym-text)]">{{ formatOptional(meal.carbsGrams) }}</p>
                          <p class="text-right text-xs text-[var(--lgym-text-muted)]">{{ meal.order ?? 0 }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>

          <v-card-actions class="flex-wrap justify-end gap-3 px-6 pb-6">
            <v-btn variant="text" @click="closePlanPreview">{{ t("trainerMemberDetails.actions.close") }}</v-btn>
            <v-btn
              v-if="!selectedPreviewPlan.isActive && selectedPreviewPlan._id"
              color="primary"
              variant="tonal"
              class="min-h-10 rounded-md px-4"
              :loading="activatingPlanId === selectedPreviewPlan._id"
              @click="activatePlan(selectedPreviewPlan)"
            >
              {{ t("trainerMemberDetails.diet.actions.activate") }}
            </v-btn>
            <v-btn variant="outlined" color="secondary" class="min-h-10 rounded-md px-4" @click="openHistoryDialog(selectedPreviewPlan)">
              {{ t("trainerMemberDetails.diet.actions.history") }}
            </v-btn>
            <v-btn variant="outlined" color="primary" class="min-h-10 rounded-md px-4" @click="openEditDialog(selectedPreviewPlan)">
              {{ t("trainerMemberDetails.diet.actions.edit") }}
            </v-btn>
            <v-btn variant="outlined" color="error" class="min-h-10 rounded-md px-4" :loading="deletingPlanId === selectedPreviewPlan._id" @click="deletePlan(selectedPreviewPlan)">
              {{ t("trainerMemberDetails.diet.actions.delete") }}
            </v-btn>
          </v-card-actions>
        </template>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isEditorOpen" max-width="900" scrollable>
      <v-card
        rounded="lg"
        class="flex max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] sm:max-h-[calc(100dvh-3rem)]"
      >
        <div class="border-b border-[var(--lgym-border)] px-6 py-5">
          <h3 class="text-xl font-semibold text-[var(--lgym-text)]">
            {{ editingPlanId ? t("trainerMemberDetails.diet.dialog.editTitle") : t("trainerMemberDetails.diet.dialog.createTitle") }}
          </h3>
        </div>

        <v-card-text class="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <div class="grid gap-6">
            <section class="rounded-2xl bg-[var(--lgym-note-bg)] px-5 py-5 sm:px-6">
              <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-[var(--lgym-text)]">{{ t("trainerMemberDetails.diet.form.modeTitle") }}</p>
                  <p class="mt-1 text-sm leading-6 text-[var(--lgym-text-muted)]">
                    {{ isMealBasedMode ? t("trainerMemberDetails.diet.form.modeMealsHint") : t("trainerMemberDetails.diet.form.modeGlobalHint") }}
                  </p>
                </div>

                <div class="rounded-2xl border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] px-4 py-3 lg:min-w-[320px]">
                  <v-switch
                    v-model="isMealBasedMode"
                    :label="isMealBasedMode ? t('trainerMemberDetails.diet.form.modeMeals') : t('trainerMemberDetails.diet.form.modeGlobal')"
                    color="primary"
                    inset
                    hide-details
                    class="w-full"
                  />
                </div>
              </div>
            </section>

            <div class="rounded-2xl border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] p-4 sm:p-5">
              <div class="grid gap-4 md:grid-cols-2">
              <v-text-field v-model="form.name" density="comfortable" variant="outlined" hide-details="auto" :error-messages="validationErrors.name">
                <template #label>
                  {{ t('trainerMemberDetails.diet.form.name') }} <span class="text-red-400">*</span>
                </template>
              </v-text-field>
              <v-text-field v-model="form.startDate" type="date" density="comfortable" variant="outlined" hide-details="auto" :error-messages="validationErrors.startDate">
                <template #label>
                  {{ t('trainerMemberDetails.diet.form.startDate') }} <span class="text-red-400">*</span>
                </template>
              </v-text-field>
              <v-text-field v-model="form.endDate" :label="t('trainerMemberDetails.diet.form.endDate')" type="date" density="comfortable" variant="outlined" hide-details />
              <div class="flex min-h-[56px] items-center rounded-2xl bg-[var(--lgym-note-bg)] px-4 py-3">
                <v-switch v-model="form.isActive" :label="t('trainerMemberDetails.diet.form.isActive')" color="primary" inset hide-details class="w-full" />
              </div>
              <v-text-field
                :model-value="isMealBasedMode ? aggregatedMealMacros.estimatedCalories ?? '' : form.estimatedCalories"
                type="number"
                :label="t('trainerMemberDetails.diet.macros.calories')"
                density="comfortable"
                variant="outlined"
                hide-details
                :readonly="isMealBasedMode"
                :prepend-inner-icon="isMealBasedMode ? 'mdi-lock-outline' : undefined"
                :class="{ 'diet-readonly-field': isMealBasedMode }"
                @update:model-value="form.estimatedCalories = toNullableNumber($event)"
              />
              <v-text-field
                :model-value="isMealBasedMode ? aggregatedMealMacros.proteinGrams ?? '' : form.proteinGrams"
                type="number"
                :label="t('trainerMemberDetails.diet.macros.protein')"
                density="comfortable"
                variant="outlined"
                hide-details
                :readonly="isMealBasedMode"
                :prepend-inner-icon="isMealBasedMode ? 'mdi-lock-outline' : undefined"
                :class="{ 'diet-readonly-field': isMealBasedMode }"
                @update:model-value="form.proteinGrams = toNullableNumber($event)"
              />
              <v-text-field
                :model-value="isMealBasedMode ? aggregatedMealMacros.carbsGrams ?? '' : form.carbsGrams"
                type="number"
                :label="t('trainerMemberDetails.diet.macros.carbs')"
                density="comfortable"
                variant="outlined"
                hide-details
                :readonly="isMealBasedMode"
                :prepend-inner-icon="isMealBasedMode ? 'mdi-lock-outline' : undefined"
                :class="{ 'diet-readonly-field': isMealBasedMode }"
                @update:model-value="form.carbsGrams = toNullableNumber($event)"
              />
              <v-text-field
                :model-value="isMealBasedMode ? aggregatedMealMacros.fatGrams ?? '' : form.fatGrams"
                type="number"
                :label="t('trainerMemberDetails.diet.macros.fat')"
                density="comfortable"
                variant="outlined"
                hide-details
                :readonly="isMealBasedMode"
                :prepend-inner-icon="isMealBasedMode ? 'mdi-lock-outline' : undefined"
                :class="{ 'diet-readonly-field': isMealBasedMode }"
                @update:model-value="form.fatGrams = toNullableNumber($event)"
              />
              </div>
            </div>

            <p v-if="isMealBasedMode" class="-mt-2 text-xs leading-5 text-[var(--lgym-text-soft)]">
              {{ t("trainerMemberDetails.diet.form.autoCalculatedHint") }}
            </p>
            <p v-else class="-mt-2 text-xs leading-5 text-[var(--lgym-text-soft)]">
              {{ t("trainerMemberDetails.diet.form.globalTargetHint") }}
            </p>
            <p v-if="validationErrors.globalTarget.length > 0" class="-mt-2 text-sm text-red-400">
              {{ validationErrors.globalTarget[0] }}
            </p>

            <v-textarea v-model="form.notes" :label="t('trainerMemberDetails.diet.form.notes')" rows="4" auto-grow density="comfortable" variant="outlined" hide-details="auto" />

            <section v-if="isMealBasedMode" class="rounded-2xl bg-[var(--lgym-note-bg)] px-5 py-5 sm:px-6">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <p class="text-sm font-semibold text-[var(--lgym-text)]">{{ t("trainerMemberDetails.diet.meals.title") }}</p>
                <v-btn
                  variant="outlined"
                  class="min-h-10 rounded-md border-[var(--lgym-nav-active-border)] bg-[var(--lgym-surface-card)] px-4 text-[var(--lgym-primary)]"
                  @click="addMeal"
                >
                  {{ t("trainerMemberDetails.diet.actions.addMeal") }}
                </v-btn>
              </div>

              <VueDraggable
                v-model="form.meals"
                :animation="180"
                handle=".diet-meal-drag-handle"
                ghost-class="diet-meal-ghost"
                chosen-class="diet-meal-chosen"
                drag-class="diet-meal-drag"
                class="mt-4 grid max-h-[36vh] gap-3 overflow-y-auto pb-1 pr-1"
                @update="syncMealOrders"
              >
                <div
                  v-for="(meal, index) in form.meals"
                  :key="meal.clientKey"
                  class="rounded-2xl border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] px-4 py-4 sm:px-5"
                >
                  <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div class="flex items-center gap-2">
                      <div
                        class="diet-meal-drag-handle flex min-h-9 items-center gap-1.5 rounded-md px-2 text-[var(--lgym-text-muted)] transition-colors hover:bg-[var(--lgym-note-bg)] hover:text-[var(--lgym-text)]"
                        :title="t('trainerMemberDetails.diet.meals.item', { index: index + 1 })"
                        :aria-label="t('trainerMemberDetails.diet.meals.item', { index: index + 1 })"
                      >
                        <v-icon icon="mdi-drag" size="18" />
                        <span class="text-xs font-medium">#{{ index + 1 }}</span>
                      </div>
                      <p class="font-semibold text-[var(--lgym-text)]">{{ t("trainerMemberDetails.diet.meals.item", { index: index + 1 }) }}</p>
                    </div>
                    <v-btn variant="text" class="min-h-9 px-0 text-[rgb(var(--v-theme-error))]" @click="removeMeal(index)">
                      {{ t("trainerMemberDetails.diet.actions.removeMeal") }}
                    </v-btn>
                  </div>

                  <div class="grid gap-3 lg:grid-cols-[minmax(220px,2fr)_110px_110px_110px_110px]">
                    <v-text-field v-model="meal.name" density="comfortable" variant="outlined" hide-details="auto" :error-messages="validationErrors.mealNames[meal.clientKey] ?? []">
                      <template #label>
                        {{ t('trainerMemberDetails.diet.form.mealName') }} <span class="text-red-400">*</span>
                      </template>
                    </v-text-field>
                    <v-text-field
                      :model-value="mealMacroSummaries[index]?.estimatedCalories ?? meal.estimatedCalories"
                      type="number"
                      :label="t('trainerMemberDetails.diet.macros.calories')"
                      density="comfortable"
                      variant="outlined"
                      hide-details
                      readonly
                      prepend-inner-icon="mdi-calculator-variant-outline"
                      class="diet-readonly-field"
                    />
                    <v-text-field v-model.number="meal.proteinGrams" type="number" :label="t('trainerMemberDetails.diet.macros.protein')" density="comfortable" variant="outlined" hide-details />
                    <v-text-field v-model.number="meal.fatGrams" type="number" :label="t('trainerMemberDetails.diet.macros.fat')" density="comfortable" variant="outlined" hide-details />
                    <v-text-field v-model.number="meal.carbsGrams" type="number" :label="t('trainerMemberDetails.diet.macros.carbs')" density="comfortable" variant="outlined" hide-details />
                  </div>

                  <v-textarea
                    v-model="meal.description"
                    class="mt-4"
                    :label="t('trainerMemberDetails.diet.form.mealDescription')"
                    rows="2"
                    auto-grow
                    density="comfortable"
                    variant="outlined"
                    hide-details
                  />
                </div>
              </VueDraggable>
            </section>
          </div>
        </v-card-text>
        <v-card-actions class="shrink-0 border-t border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] justify-end gap-3 px-6 py-4 sm:py-5">
          <v-btn variant="text" class="text-[var(--lgym-text-muted)]" @click="isEditorOpen = false">{{ t("trainerMemberDetails.actions.cancel") }}</v-btn>
          <v-btn
            :loading="isSaving"
            class="bg-[var(--lgym-primary)] text-[rgb(var(--v-theme-on-primary))]"
            @click="savePlan"
          >
            {{ t("trainerMemberDetails.actions.save") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isHistoryOpen" max-width="760">
      <v-card rounded="lg">
        <v-card-title class="text-lg font-semibold">{{ t("trainerMemberDetails.diet.dialog.historyTitle") }}</v-card-title>
        <v-card-text class="px-6 py-5">
          <v-progress-linear v-if="isLoadingHistory" indeterminate color="primary" />
          <div v-else-if="historyEntries.length === 0" class="py-8 text-center text-sm text-[var(--lgym-text-muted)]">
            {{ t("trainerMemberDetails.diet.history.empty") }}
          </div>
          <div v-else class="grid gap-3">
            <article v-for="(entry, index) in historyEntries" :key="entry._id ?? entry.changeDate ?? entry.changeType ?? 'history-entry'" class="rounded-md border border-[var(--lgym-border)] p-4">
              <div class="flex items-center justify-between gap-3">
                <p class="font-semibold text-[var(--lgym-text)]">{{ entry.changeType || t("trainerMemberDetails.diet.history.unknown") }}</p>
                <span class="text-xs text-[var(--lgym-text-muted)]">{{ formatDateTime(entry.changeDate) }}</span>
              </div>
              <div class="mt-3 rounded-md bg-[var(--lgym-note-bg)] p-3">
                <template v-if="getHistorySummary(entry, historyEntries[index + 1]).length > 0">
                  <div v-for="change in getHistorySummary(entry, historyEntries[index + 1])" :key="change.key" class="grid gap-1 py-2 text-sm text-[var(--lgym-text-muted)] sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-3">
                    <span class="text-[var(--lgym-text)]">{{ change.label }}</span>
                    <span>{{ change.from }}</span>
                    <span class="font-medium text-[var(--lgym-text)]">{{ change.to }}</span>
                  </div>
                </template>
                <p v-else class="text-sm text-[var(--lgym-text-muted)]">
                  {{ t("trainerMemberDetails.diet.history.noVisibleChanges") }}
                </p>
              </div>
            </article>
          </div>
        </v-card-text>
        <v-card-actions class="justify-end px-6 pb-6">
          <v-btn variant="text" @click="isHistoryOpen = false">{{ t("trainerMemberDetails.actions.close") }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import { useI18n } from "vue-i18n";

import {
  activateTrainerDietPlan,
  createTrainerDietPlan,
  deleteTrainerDietPlan,
  getTrainerDietPlanHistory,
  getTrainerDietPlans,
  updateTrainerDietPlan,
  type DietMealDto,
  type DietPlanDto,
  type DietPlanHistoryDto,
  type UpsertDietPlanRequest,
} from "../../../api/trainerDietPlans";
import { getApiErrorMessage } from "../../../api/trainerInvitations";
import { useConfirmDialog } from "../../../composables/useConfirmDialog";
import { useToast } from "../../../composables/useToast";

const props = defineProps<{
  traineeId: string;
  formatDateTime: (value: string | null | undefined) => string;
}>();

const { t } = useI18n();
const toast = useToast();
const { confirm } = useConfirmDialog();

type EditableMeal = {
  clientKey: number;
  name: string;
  order: number;
  description: string;
  estimatedCalories: number | null;
  proteinGrams: number | null;
  carbsGrams: number | null;
  fatGrams: number | null;
};

type DietHistorySnapshot = {
  name?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  estimatedCalories?: number | null;
  proteinGrams?: number | null;
  carbsGrams?: number | null;
  fatGrams?: number | null;
  notes?: string | null;
  isActive?: boolean;
  meals?: DietMealDto[] | null;
};

type HistorySummaryRow = {
  key: string;
  label: string;
  from: string;
  to: string;
};

type ValidationErrors = {
  name: string[];
  startDate: string[];
  mealNames: Record<number, string[]>;
  globalTarget: string[];
};

type DietPlanFormState = Omit<UpsertDietPlanRequest, "meals"> & {
  meals: EditableMeal[];
};

let nextMealClientKey = 1;

const plans = ref<DietPlanDto[]>([]);
const historyEntries = ref<DietPlanHistoryDto[]>([]);
const isLoading = ref(false);
const hasError = ref(false);
const isSaving = ref(false);
const isPreviewOpen = ref(false);
const isEditorOpen = ref(false);
const isHistoryOpen = ref(false);
const isLoadingHistory = ref(false);
const editingPlanId = ref<string | null>(null);
const activatingPlanId = ref<string | null>(null);
const deletingPlanId = ref<string | null>(null);
const selectedPreviewPlanId = ref<string | null>(null);
const isMealBasedMode = ref(true);
const validationErrors = ref<ValidationErrors>({
  name: [],
  startDate: [],
  mealNames: {},
  globalTarget: [],
});

const form = ref<DietPlanFormState>({
  name: "",
  startDate: "",
  endDate: "",
  estimatedCalories: null,
  proteinGrams: null,
  carbsGrams: null,
  fatGrams: null,
  notes: "",
  isActive: true,
  meals: [],
});

const sortedPlans = computed(() =>
  [...plans.value].sort((left, right) => {
    if (Boolean(left.isActive) !== Boolean(right.isActive)) {
      return left.isActive ? -1 : 1;
    }

    const leftTime = left.updatedAt ? new Date(left.updatedAt).getTime() : 0;
    const rightTime = right.updatedAt ? new Date(right.updatedAt).getTime() : 0;
    return rightTime - leftTime;
  }),
);

const activePlans = computed(() => sortedPlans.value.filter((plan) => plan.isActive));

const selectedPreviewPlan = computed(
  () => sortedPlans.value.find((plan) => plan._id === selectedPreviewPlanId.value) ?? null,
);

const plansCountLabel = computed(() => {
  const activeCount = activePlans.value.length;
  const totalCount = sortedPlans.value.length;

  if (activeCount === 0) {
    return `${totalCount} plans`;
  }

  return `${totalCount} plans · ${activeCount} active`;
});

const createEditableMeal = (meal?: Partial<EditableMeal>): EditableMeal => ({
  clientKey: nextMealClientKey++,
  name: meal?.name || "",
  order: meal?.order ?? 0,
  description: meal?.description || "",
  estimatedCalories: meal?.estimatedCalories ?? null,
  proteinGrams: meal?.proteinGrams ?? null,
  carbsGrams: meal?.carbsGrams ?? null,
  fatGrams: meal?.fatGrams ?? null,
});

const toNullableNumber = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const toSafeNumber = (value: number | null | undefined) => (typeof value === "number" && Number.isFinite(value) ? value : 0);

const calculateCaloriesFromMacros = (proteinGrams: number | null, carbsGrams: number | null, fatGrams: number | null) => {
  const protein = toSafeNumber(proteinGrams);
  const carbs = toSafeNumber(carbsGrams);
  const fat = toSafeNumber(fatGrams);
  const total = protein * 4 + carbs * 4 + fat * 9;

  return total > 0 ? total : null;
};

const mealMacroSummaries = computed(() =>
  form.value.meals.map((meal) => ({
    proteinGrams: toNullableNumber(meal.proteinGrams),
    carbsGrams: toNullableNumber(meal.carbsGrams),
    fatGrams: toNullableNumber(meal.fatGrams),
    estimatedCalories: calculateCaloriesFromMacros(
      toNullableNumber(meal.proteinGrams),
      toNullableNumber(meal.carbsGrams),
      toNullableNumber(meal.fatGrams),
    ),
  })),
);

const aggregatedMealMacros = computed(() => {
  let proteinGrams = 0;
  let carbsGrams = 0;
  let fatGrams = 0;
  let hasAnyMacroValue = false;

  mealMacroSummaries.value.forEach((meal) => {
    if (meal.proteinGrams != null || meal.carbsGrams != null || meal.fatGrams != null) {
      hasAnyMacroValue = true;
    }

    proteinGrams += toSafeNumber(meal.proteinGrams);
    carbsGrams += toSafeNumber(meal.carbsGrams);
    fatGrams += toSafeNumber(meal.fatGrams);
  });

  if (!hasAnyMacroValue) {
    return {
      estimatedCalories: null,
      proteinGrams: null,
      carbsGrams: null,
      fatGrams: null,
    };
  }

  return {
    estimatedCalories: calculateCaloriesFromMacros(proteinGrams, carbsGrams, fatGrams),
    proteinGrams,
    carbsGrams,
    fatGrams,
  };
});

const resetForm = () => {
  isMealBasedMode.value = true;
  validationErrors.value = {
    name: [],
    startDate: [],
    mealNames: {},
    globalTarget: [],
  };
  form.value = {
    name: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    estimatedCalories: null,
    proteinGrams: null,
    carbsGrams: null,
    fatGrams: null,
    notes: "",
    isActive: true,
    meals: [createEditableMeal({ order: 0 })],
  };
  editingPlanId.value = null;
};

const getDietPreview = (plan: DietPlanDto) => {
  const normalizedNotes = plan.notes?.trim();
  if (normalizedNotes) {
    return normalizedNotes;
  }

  return t("trainerMemberDetails.diet.meta.mealCount", { count: plan.meals?.length ?? 0 });
};

const openPlanPreview = (plan: DietPlanDto) => {
  selectedPreviewPlanId.value = plan._id || null;
  isPreviewOpen.value = true;
};

const closePlanPreview = () => {
  isPreviewOpen.value = false;
  selectedPreviewPlanId.value = null;
};

const loadPlans = async () => {
  if (!props.traineeId) return;
  isLoading.value = true;
  hasError.value = false;

  try {
    const response = await getTrainerDietPlans(props.traineeId);
    if (response.status !== 200) {
      throw new Error(getApiErrorMessage(response.data) || "Failed to load diet plans");
    }

    plans.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(error);
    hasError.value = true;
  } finally {
    isLoading.value = false;
  }
};

const openCreateDialog = () => {
  closePlanPreview();
  resetForm();
  isEditorOpen.value = true;
};

const openEditDialog = (plan: DietPlanDto) => {
  closePlanPreview();
  validationErrors.value = {
    name: [],
    startDate: [],
    mealNames: {},
    globalTarget: [],
  };
  editingPlanId.value = plan._id || null;
  isMealBasedMode.value = Array.isArray(plan.meals) && plan.meals.length > 0;
  form.value = {
    name: plan.name || "",
    startDate: plan.startDate || new Date().toISOString().slice(0, 10),
    endDate: plan.endDate || "",
    estimatedCalories: plan.estimatedCalories ?? null,
    proteinGrams: plan.proteinGrams ?? null,
    carbsGrams: plan.carbsGrams ?? null,
    fatGrams: plan.fatGrams ?? null,
    notes: plan.notes || "",
    isActive: Boolean(plan.isActive),
    meals: sortMeals(plan.meals).map((meal) =>
      createEditableMeal({
        name: meal.name || "",
        order: meal.order ?? 0,
        description: meal.description || "",
        estimatedCalories: meal.estimatedCalories ?? null,
        proteinGrams: meal.proteinGrams ?? null,
        carbsGrams: meal.carbsGrams ?? null,
        fatGrams: meal.fatGrams ?? null,
      }),
    ),
  };

  if (isMealBasedMode.value && form.value.meals.length === 0) {
    addMeal();
  }

  isEditorOpen.value = true;
};

const addMeal = () => {
  form.value.meals.push(createEditableMeal({ order: form.value.meals.length }));
  syncMealOrders();
};

const removeMeal = (index: number) => {
  form.value.meals.splice(index, 1);
  if (isMealBasedMode.value && form.value.meals.length === 0) {
    addMeal();
    return;
  }
  syncMealOrders();
};

const syncMealOrders = () => {
  form.value.meals.forEach((meal, index) => {
    meal.order = index;
  });
};

const hasAtLeastOneGlobalTarget = () =>
  [form.value.estimatedCalories, form.value.proteinGrams, form.value.carbsGrams, form.value.fatGrams].some(
    (value) => toNullableNumber(value) != null,
  );

const validateForm = () => {
  const nextErrors: ValidationErrors = {
    name: [],
    startDate: [],
    mealNames: {},
    globalTarget: [],
  };

  if (!form.value.name.trim()) {
    nextErrors.name.push(t("trainerMemberDetails.diet.validation.nameRequired"));
  }

  if (!form.value.startDate) {
    nextErrors.startDate.push(t("trainerMemberDetails.diet.validation.startDateRequired"));
  }

  if (isMealBasedMode.value) {
    form.value.meals.forEach((meal) => {
      if (!meal.name.trim()) {
        nextErrors.mealNames[meal.clientKey] = [t("trainerMemberDetails.diet.validation.mealNameRequired")];
      }
    });
  } else if (!hasAtLeastOneGlobalTarget()) {
    nextErrors.globalTarget.push(t("trainerMemberDetails.diet.validation.globalTargetRequired"));
  }

  validationErrors.value = nextErrors;
  return (
    nextErrors.name.length === 0
    && nextErrors.startDate.length === 0
    && nextErrors.globalTarget.length === 0
    && Object.keys(nextErrors.mealNames).length === 0
  );
};

const toPayload = (): UpsertDietPlanRequest => ({
  ...form.value,
  estimatedCalories: isMealBasedMode.value ? aggregatedMealMacros.value.estimatedCalories : toNullableNumber(form.value.estimatedCalories),
  proteinGrams: isMealBasedMode.value ? aggregatedMealMacros.value.proteinGrams : toNullableNumber(form.value.proteinGrams),
  carbsGrams: isMealBasedMode.value ? aggregatedMealMacros.value.carbsGrams : toNullableNumber(form.value.carbsGrams),
  fatGrams: isMealBasedMode.value ? aggregatedMealMacros.value.fatGrams : toNullableNumber(form.value.fatGrams),
  endDate: form.value.endDate || null,
  notes: form.value.notes?.trim() || null,
  meals: isMealBasedMode.value
    ? form.value.meals.map((meal, index) => ({
        estimatedCalories: mealMacroSummaries.value[index]?.estimatedCalories ?? null,
        name: meal.name,
        proteinGrams: toNullableNumber(meal.proteinGrams),
        carbsGrams: toNullableNumber(meal.carbsGrams),
        fatGrams: toNullableNumber(meal.fatGrams),
        order: index,
        description: meal.description?.trim() || null,
      }))
    : [],
});

const savePlan = async () => {
  if (!validateForm()) {
    return;
  }

  isSaving.value = true;

  try {
    const response = editingPlanId.value
      ? await updateTrainerDietPlan(props.traineeId, editingPlanId.value, toPayload())
      : await createTrainerDietPlan(props.traineeId, toPayload());

    if (![200, 201].includes(response.status)) {
      throw new Error(getApiErrorMessage(response.data) || "Failed to save diet plan");
    }

    isEditorOpen.value = false;
    await loadPlans();
    toast.successMessage(t("trainerMemberDetails.diet.feedback.saved"));
  } catch (error) {
    console.error(error);
    toast.errorMessage(
      error instanceof Error
        ? error.message
        : t("trainerMemberDetails.diet.feedback.saveFailed"),
    );
  } finally {
    isSaving.value = false;
  }
};

const activatePlan = async (plan: DietPlanDto) => {
  if (!plan._id) return;
  activatingPlanId.value = plan._id;

  try {
    const response = await activateTrainerDietPlan(props.traineeId, plan._id);
    if (response.status !== 200) {
      throw new Error(getApiErrorMessage(response.data) || "Failed to activate diet plan");
    }

    if (selectedPreviewPlanId.value === plan._id) {
      closePlanPreview();
    }

    await loadPlans();
    toast.successMessage(t("trainerMemberDetails.diet.feedback.activated"));
  } catch (error) {
    console.error(error);
    toast.errorMessage(
      error instanceof Error
        ? error.message
        : t("trainerMemberDetails.diet.feedback.activateFailed"),
    );
  } finally {
    activatingPlanId.value = null;
  }
};

const deletePlan = async (plan: DietPlanDto) => {
  if (!plan._id) return;

  const accepted = await confirm({
    title: t("trainerMemberDetails.diet.confirm.deleteTitle"),
    description: t("trainerMemberDetails.diet.confirm.deleteMessage", {
      name: plan.name || t("trainerMemberDetails.diet.fallback.noName"),
    }),
    confirmLabel: t("trainerMemberDetails.diet.actions.delete"),
    cancelLabel: t("trainerMemberDetails.actions.cancel"),
    confirmColor: "error",
    isDestructive: true,
  });

  if (!accepted) return;

  deletingPlanId.value = plan._id;
  try {
    const response = await deleteTrainerDietPlan(props.traineeId, plan._id);
    if (response.status !== 200) {
      throw new Error(getApiErrorMessage(response.data) || "Failed to delete diet plan");
    }

    if (selectedPreviewPlanId.value === plan._id) {
      closePlanPreview();
    }

    await loadPlans();
    toast.successMessage(t("trainerMemberDetails.diet.feedback.deleted"));
  } catch (error) {
    console.error(error);
    toast.errorMessage(
      error instanceof Error
        ? error.message
        : t("trainerMemberDetails.diet.feedback.deleteFailed"),
    );
  } finally {
    deletingPlanId.value = null;
  }
};

const openHistoryDialog = async (plan: DietPlanDto) => {
  if (!plan._id) return;
  closePlanPreview();
  isHistoryOpen.value = true;
  isLoadingHistory.value = true;

  try {
    const response = await getTrainerDietPlanHistory(props.traineeId, plan._id);
    if (response.status !== 200) {
      throw new Error(getApiErrorMessage(response.data) || "Failed to load diet history");
    }
    historyEntries.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(error);
    historyEntries.value = [];
    toast.errorMessage(
      error instanceof Error
        ? error.message
        : t("trainerMemberDetails.diet.feedback.historyFailed"),
    );
  } finally {
    isLoadingHistory.value = false;
  }
};

const sortMeals = (meals?: DietMealDto[] | null) =>
  [...(meals || [])].sort((left, right) => (left.order ?? 0) - (right.order ?? 0));

const formatOptional = (value?: string | number | null) =>
  value != null ? String(value) : "—";

const formatHistoryValue = (value: string | number | boolean | null | undefined, kind: "text" | "date" | "bool" = "text") => {
  if (value == null || value === "") {
    return t("trainerMemberDetails.diet.history.emptyValue");
  }

  if (kind === "date" && typeof value === "string") {
    return value;
  }

  if (kind === "bool" && typeof value === "boolean") {
    return value
      ? t("trainerMemberDetails.diet.history.boolTrue")
      : t("trainerMemberDetails.diet.history.boolFalse");
  }

  return String(value);
};

const parseHistorySnapshot = (snapshotJson?: string | null): DietHistorySnapshot | null => {
  if (!snapshotJson) {
    return null;
  }

  try {
    return JSON.parse(snapshotJson) as DietHistorySnapshot;
  } catch {
    return null;
  }
};

const getHistorySummary = (entry: DietPlanHistoryDto, previousEntry?: DietPlanHistoryDto): HistorySummaryRow[] => {
  const current = parseHistorySnapshot(entry.snapshotJson);
  const previous = parseHistorySnapshot(previousEntry?.snapshotJson);

  if (!current) {
    return [];
  }

  const changes: HistorySummaryRow[] = [];
  const fieldConfigs: Array<{ key: keyof DietHistorySnapshot; label: string; kind?: "text" | "date" | "bool" }> = [
    { key: "name", label: t("trainerMemberDetails.diet.history.fieldName") },
    { key: "startDate", label: t("trainerMemberDetails.diet.history.fieldStartDate"), kind: "date" },
    { key: "endDate", label: t("trainerMemberDetails.diet.history.fieldEndDate"), kind: "date" },
    { key: "estimatedCalories", label: t("trainerMemberDetails.diet.history.fieldCalories") },
    { key: "proteinGrams", label: t("trainerMemberDetails.diet.history.fieldProtein") },
    { key: "carbsGrams", label: t("trainerMemberDetails.diet.history.fieldCarbs") },
    { key: "fatGrams", label: t("trainerMemberDetails.diet.history.fieldFat") },
    { key: "notes", label: t("trainerMemberDetails.diet.history.fieldNotes") },
    { key: "isActive", label: t("trainerMemberDetails.diet.history.fieldIsActive"), kind: "bool" },
  ];

  fieldConfigs.forEach((field) => {
    const currentValue = current[field.key];
    const previousValue = previous?.[field.key];
    if (previous && currentValue === previousValue) {
      return;
    }

    if (!previous && entry.changeType === "Created") {
      changes.push({
        key: String(field.key),
        label: field.label,
        from: t("trainerMemberDetails.diet.history.createdSummary"),
        to: formatHistoryValue(currentValue as string | number | boolean | null | undefined, field.kind),
      });
      return;
    }

    changes.push({
      key: String(field.key),
      label: field.label,
      from: formatHistoryValue(previousValue as string | number | boolean | null | undefined, field.kind),
      to: formatHistoryValue(currentValue as string | number | boolean | null | undefined, field.kind),
    });
  });

  const currentMeals = sortMeals(current.meals);
  const previousMeals = sortMeals(previous?.meals);

  if (!previous || currentMeals.length !== previousMeals.length) {
    changes.push({
      key: "meal-count",
      label: t("trainerMemberDetails.diet.history.fieldMealCount"),
      from: formatHistoryValue(previousMeals.length),
      to: formatHistoryValue(currentMeals.length),
    });
  }

  const mealFieldConfigs: Array<{ key: keyof DietMealDto; label: string }> = [
    { key: "name", label: t("trainerMemberDetails.diet.form.mealName") },
    { key: "description", label: t("trainerMemberDetails.diet.form.mealDescription") },
    { key: "estimatedCalories", label: t("trainerMemberDetails.diet.macros.calories") },
    { key: "proteinGrams", label: t("trainerMemberDetails.diet.macros.protein") },
    { key: "carbsGrams", label: t("trainerMemberDetails.diet.macros.carbs") },
    { key: "fatGrams", label: t("trainerMemberDetails.diet.macros.fat") },
  ];

  const maxMeals = Math.max(currentMeals.length, previousMeals.length);
  for (let index = 0; index < maxMeals; index += 1) {
    const currentMeal = currentMeals[index];
    const previousMeal = previousMeals[index];
    const mealLabel = currentMeal?.name || previousMeal?.name || t("trainerMemberDetails.diet.meals.item", { index: index + 1 });

    if (currentMeal && !previousMeal) {
      changes.push({
        key: `meal-added-${index}`,
        label: t("trainerMemberDetails.diet.history.mealAdded", { meal: mealLabel }),
        from: t("trainerMemberDetails.diet.history.emptyValue"),
        to: t("trainerMemberDetails.diet.history.boolTrue"),
      });
      continue;
    }

    if (!currentMeal && previousMeal) {
      changes.push({
        key: `meal-removed-${index}`,
        label: t("trainerMemberDetails.diet.history.mealRemoved", { meal: mealLabel }),
        from: t("trainerMemberDetails.diet.history.boolTrue"),
        to: t("trainerMemberDetails.diet.history.emptyValue"),
      });
      continue;
    }

    if (!currentMeal || !previousMeal) {
      continue;
    }

    mealFieldConfigs.forEach((field) => {
      if (currentMeal[field.key] === previousMeal[field.key]) {
        return;
      }

      changes.push({
        key: `meal-${index}-${String(field.key)}`,
        label: t("trainerMemberDetails.diet.history.mealFieldPrefix", { meal: mealLabel, field: field.label }),
        from: formatHistoryValue(previousMeal[field.key] as string | number | boolean | null | undefined),
        to: formatHistoryValue(currentMeal[field.key] as string | number | boolean | null | undefined),
      });
    });
  }

  return changes;
};

const formatDateTime = (value?: string | null) => props.formatDateTime(value);

watch(() => props.traineeId, () => {
  closePlanPreview();
  void loadPlans();
}, { immediate: true });
watch(isMealBasedMode, (enabled) => {
  if (enabled && form.value.meals.length === 0) {
    addMeal();
  }
});
</script>

<style scoped>
.diet-card-preview {
  display: -webkit-box;
  -webkit-line-clamp: 7;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.diet-readonly-field :deep(.v-field) {
  background: color-mix(in srgb, var(--lgym-note-bg) 88%, var(--lgym-surface-card));
}

.diet-readonly-field :deep(.v-field--variant-outlined .v-field__outline__start),
.diet-readonly-field :deep(.v-field--variant-outlined .v-field__outline__notch),
.diet-readonly-field :deep(.v-field--variant-outlined .v-field__outline__end) {
  border-color: color-mix(in srgb, var(--lgym-primary) 42%, var(--lgym-border));
}

.diet-readonly-field :deep(.v-field__input),
.diet-readonly-field :deep(.v-label),
.diet-readonly-field :deep(.v-icon) {
  color: color-mix(in srgb, var(--lgym-text-muted) 84%, var(--lgym-primary));
}

.diet-readonly-field :deep(input) {
  cursor: not-allowed;
}
</style>
