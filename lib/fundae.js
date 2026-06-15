export const CREDIT_MINIMUM_FUNDAE = 420;
export const DEFAULT_SALARY_PER_EMPLOYEE = 25000;
export const TRAINING_PRICE_PER_HOUR = 7.5;

export function privateCofinancingRate(employeeCount) {
  const n = Math.max(0, Math.floor(Number.isFinite(employeeCount) ? employeeCount : 0));
  if (n < 6) return 0;
  if (n <= 9) return 0.05;
  if (n <= 49) return 0.1;
  if (n <= 249) return 0.2;
  return 0.4;
}

export function calculateFundaeCredit(employeeCount, grossPayroll) {
  const employees = Math.max(1, Math.floor(Number.isFinite(employeeCount) ? employeeCount : 1));
  const payroll = Number.isFinite(grossPayroll) && grossPayroll > 0
    ? grossPayroll
    : employees * DEFAULT_SALARY_PER_EMPLOYEE;
  const contribution = payroll * 0.007;

  if (employees <= 5) {
    return {
      employees,
      payroll: Math.round(payroll),
      contribution: Math.round(contribution),
      credit: CREDIT_MINIMUM_FUNDAE,
      bonusRate: null,
      minimumApplied: true,
      cofinancingRate: privateCofinancingRate(employees),
    };
  }

  const bonusRate = employees <= 9 ? 1 : employees <= 49 ? 0.75 : employees <= 249 ? 0.6 : 0.5;

  return {
    employees,
    payroll: Math.round(payroll),
    contribution: Math.round(contribution),
    credit: Math.round(contribution * bonusRate),
    bonusRate,
    minimumApplied: false,
    cofinancingRate: privateCofinancingRate(employees),
  };
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}
