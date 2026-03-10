<template>
  <div
    class="pawn-contract-form-confirmation text-start"
    data-testid="pawn-contract-step-confirmation"
  >
    <section
      v-for="section in sections"
      :key="section.id"
      class="pawn-contract-create-page__confirm-panel"
      :data-testid="`pawn-contract-step-section-${section.id}`"
    >
      <div class="pawn-contract-create-page__confirm-panel-head">
        <div class="pawn-contract-create-page__confirm-panel-icon">
          <i
            :class="section.iconClass"
            aria-hidden="true"
          />
        </div>
        <div class="pawn-contract-create-page__confirm-panel-copy">
          <div class="pawn-contract-create-page__section-kicker">
            {{ section.kicker }}
          </div>
          <h2 class="pawn-contract-create-page__sidebar-title">
            {{ section.title }}
          </h2>
          <p class="text-muted mb-0">
            {{ section.description }}
          </p>
        </div>
      </div>

      <div class="pawn-contract-create-page__summary-list mt-4">
        <div
          v-for="row in section.rows"
          :key="row.key"
          class="pawn-contract-create-page__summary-item"
          :data-testid="`pawn-contract-step-row-${section.id}-${row.key}`"
        >
          <div class="pawn-contract-create-page__summary-item-copy">
            <span>{{ row.label }}</span>
            <small
              v-if="row.helper"
              class="pawn-contract-create-page__summary-item-helper"
            >{{ row.helper }}</small>
          </div>
          <strong>{{ row.value }}</strong>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { PawnContractConfirmationSectionModel } from '@feature/pawn_contract/presentation/models/pawn_contract_confirmation.model';

interface PawnContractFormStepConfirmationProps {
  sections: PawnContractConfirmationSectionModel[];
}

const props = defineProps<PawnContractFormStepConfirmationProps>();
const sections: ReadonlyArray<PawnContractConfirmationSectionModel> = props.sections;
</script>

<style scoped>
.pawn-contract-form-confirmation {
  display: grid;
  gap: 1rem;
  min-width: min(86vw, 68rem);
}
</style>
