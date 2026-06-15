import { TRAINING_PRICE_PER_HOUR } from "./fundae";

const rawCourses = [
  ["ep-fisiologia-neuromuscular", "Fisiología Neuromuscular", "Entrenamiento Personal", "entrenamiento", 8, "Bases neurofisiológicas del movimiento, fuerza y fatiga."],
  ["ep-anatomia-funcional-mecanica", "Anatomía funcional y mecánica aplicada", "Entrenamiento Personal", "entrenamiento", 10, "Biomecánica aplicada a ejercicio, carrera y sprint."],
  ["ep-fisiologia-ejercicio-programacion", "Fisiología del ejercicio y programación", "Entrenamiento Personal", "entrenamiento", 33, "Planificación, readaptación, hipertrofia y pérdida de grasa."],
  ["ep-bases-anatomofisiologicas", "Bases Anatomofisiológicas", "Entrenamiento Personal", "entrenamiento", 34, "Aparato locomotor, músculo, sistema cardiorrespiratorio y metabolismo."],
  ["ep-valoracion-control", "Valoración y control del entrenamiento", "Entrenamiento Personal", "entrenamiento", 5, "Medición, control y ajuste de carga."],
  ["ep-nutricion-suplementacion", "Nutrición y suplementación para entrenamiento", "Entrenamiento Personal", "nutricion", 20, "Nutrición deportiva, suplementación y rendimiento."],
  ["lesiones-neurofisiologia-dolor", "Neurofisiología del dolor", "Lesiones y Readaptación", "lesiones", 13, "Dolor, adherencia, comunicación y neuroeducación."],
  ["lesiones-alianza-razonamiento-clinico", "Alianza terapéutica y razonamiento clínico", "Lesiones y Readaptación", "lesiones", 10, "Atención centrada en la persona y modelos terapéuticos."],
  ["lesiones-bases-fisiopatologicas-neuromecanicas", "Bases fisiopatológicas y neuromecánicas", "Lesiones y Readaptación", "lesiones", 17, "Daño tisular, movimiento y evaluación neuromecánica."],
  ["lesiones-herramientas-evaluacion", "Herramientas de evaluación", "Lesiones y Readaptación", "lesiones", 13, "Valoración física y diagnóstico por imagen."],
  ["lesiones-planificacion-periodizacion-readaptacion", "Planificación de procesos de readaptación", "Lesiones y Readaptación", "lesiones", 19, "Programación y periodización de readaptación."],
  ["patologia-medicina-estilo-vida-sistemas", "Medicina del estilo de vida y sistemas fisiológicos", "Patología y Estilo de Vida", "patologia", 27, "Bases de medicina del estilo de vida y salud."],
  ["patologia-cardiometabolicas-digestivas", "Patologías cardiometabólicas y digestivas", "Patología y Estilo de Vida", "patologia", 27, "Nutrición y ejercicio en patología metabólica y digestiva."],
  ["patologia-respiratorio-nervioso", "Patologías respiratorias y nerviosas", "Patología y Estilo de Vida", "patologia", 21, "Abordaje desde nutrición y ejercicio."],
  ["mujer-ciclo-menstrual-hormonal", "Ciclo menstrual y alteraciones hormonales", "Mujer Deportista", "mujer", 23, "Fisiología, nutrición y ejercicio en cada fase."],
  ["mujer-nutricion-suplementacion", "Nutrición y suplementación en mujer deportista", "Mujer Deportista", "mujer", 15, "Estrategias nutricionales y suplementación específica."],
  ["mujer-composicion-cetogenica-ayuno", "Composición corporal, cetogénica y ayuno", "Mujer Deportista", "mujer", 19, "Composición corporal, dieta cetogénica y ayuno intermitente."],
];

export const courses = rawCourses.map(([id, title, master, area, hours, summary]) => ({
  id,
  title,
  master,
  area,
  hours,
  price: Math.round(hours * TRAINING_PRICE_PER_HOUR),
  summary,
}));

export const courseById = new Map(courses.map((course) => [course.id, course]));

export function recommendCourses({ sectorFamily, employeeCount, requestedCourseSlug }) {
  const family = sectorFamily || "";
  const n = Number(employeeCount) || 0;

  const byArea = family === "salud"
    ? ["lesiones", "patologia", "mujer"]
    : family === "deporte"
      ? ["entrenamiento", "nutricion", "lesiones"]
      : family === "empresa"
        ? ["entrenamiento", "patologia", "nutricion"]
        : ["entrenamiento", "lesiones", "nutricion", "patologia"];

  const ranked = courses
    .map((course) => {
      let score = byArea.includes(course.area) ? 20 - byArea.indexOf(course.area) * 3 : 4;
      if (requestedCourseSlug && course.id.includes(requestedCourseSlug.replace(/^master-/, "").replace(/-completo$/, ""))) score += 8;
      if (n <= 5 && course.price <= 150) score += 5;
      if (n >= 10 && course.hours >= 17) score += 4;
      return { ...course, score };
    })
    .sort((a, b) => b.score - a.score || b.hours - a.hours);

  return ranked.slice(0, 6);
}
