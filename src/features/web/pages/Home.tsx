import { Link } from 'react-router-dom';
import {
  RiStethoscopeLine,
  RiHeartsLine,
  RiHeartPulseLine,
  RiHandHeartLine,
  RiWomenLine,
  RiRunLine,
  RiStarFill,
  RiPhoneLine,
  RiMapPin2Line,
  RiCalendarLine,
  RiUserStarLine,
  RiShieldStarLine,
  RiTeamLine,
} from 'react-icons/ri';

/* ─── Data ─── */

const specialties = [
  {
    icon: RiStethoscopeLine,
    title: 'Clínica General',
    desc: 'Atención integral para adultos. Diagnóstico, tratamiento y prevención de enfermedades comunes y crónicas.',
  },
  {
    icon: RiHeartsLine,
    title: 'Pediatría',
    desc: 'Control de salud del neonato al adolescente. Vacunas, desarrollo y cuidado preventivo.',
  },
  {
    icon: RiHeartPulseLine,
    title: 'Cardiología',
    desc: 'Diagnóstico y tratamiento de enfermedades del corazón. Electrocardiograma, ecocardiograma y Holter.',
  },
  {
    icon: RiHandHeartLine,
    title: 'Dermatología',
    desc: 'Enfermedades de la piel, cabello y uñas. Tratamientos estéticos y preventivos.',
  },
  {
    icon: RiWomenLine,
    title: 'Ginecología',
    desc: 'Salud de la mujer. Control prenatal, check-up ginecológico y planificación familiar.',
  },
  {
    icon: RiRunLine,
    title: 'Traumatología',
    desc: 'Lesiones de huesos, articulaciones y músculos. Rehabilitación y medicina deportiva.',
  },
];

const doctors = [
  {
    name: 'Dr. Alejandro Ruiz',
    specialty: 'Medicina General',
    license: 'MN 12345',
    bio: 'Especialista con 20 años de experiencia en atención primaria. Profesor adjunto en la UBA.',
  },
  {
    name: 'Dra. Sofía Peralta',
    specialty: 'Pediatría',
    license: 'MN 23456',
    bio: 'Residencia en Hospital de Niños Ricardo Gutiérrez. Enfoque en desarrollo infantil temprano.',
  },
  {
    name: 'Dr. Lucas Benítez',
    specialty: 'Cardiología',
    license: 'MN 34567',
    bio: 'Fellowship en hemodinamia. Referente en prevención cardiovascular y rehabilitación.',
  },
  {
    name: 'Dra. Valentina López',
    specialty: 'Dermatología',
    license: 'MN 45678',
    bio: 'Especialista en dermatología clínica y estética. Certificación internacional en láseres.',
  },
  {
    name: 'Dr. Mateo Álvarez',
    specialty: 'Traumatología',
    license: 'MN 56789',
    bio: 'Cirujano ortopédico. Ex-profesor del Hospital Italiano. Enfoque en cirugía artroscópica.',
  },
  {
    name: 'Dra. Camila Herrera',
    specialty: 'Ginecología',
    license: 'MN 67890',
    bio: 'Especialista en ginecología obstétrica. Más de 15 años acompañando embarazos.',
  },
];

const bookingSteps = [
  {
    num: '01',
    title: 'Elegí tu especialidad',
    desc: 'Seleccioná entre nuestras 20+ especialidades la que necesitás.',
  },
  {
    num: '02',
    title: 'Elegí fecha y hora',
    desc: 'Visualizá la disponibilidad en tiempo real y elegí el turno que mejor te quede.',
  },
  {
    num: '03',
    title: 'Confirmá tu turno',
    desc: 'Recibí la confirmación por WhatsApp o email con todos los detalles.',
  },
];

const testimonials = [
  {
    name: 'María González',
    text: 'Llevo a mi familia a Clínica Nova hace 5 años. Los doctores son excelentes y siempre nos tratan con mucha paciencia y profesionalismo.',
    rating: 5,
  },
  {
    name: 'Carlos Fernández',
    text: 'Me operé de rodilla con el Dr. Álvarez. La recuperación fue mucho más rápida de lo que esperaba. Totalmente recomendado.',
    rating: 5,
  },
  {
    name: 'Ana Martínez',
    text: 'La Dra. Peralta atiende a mis hijos desde que nacieron. Siempre atenta, cariñosa y muy profesional. No la cambiaría por nada.',
    rating: 5,
  },
];

/* ─── Component ─── */

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section id="inicio" className="relative overflow-hidden bg-bg">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_var(--color-accent-soft)_0%,transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32 text-center">
          <span className="inline-block rounded-full bg-accent-soft px-4 py-1.5 text-xs font-medium text-accent mb-6">
            Más de 15 años cuidando tu salud
          </span>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-text sm:text-5xl md:text-6xl">
            Tu salud, nuestra{' '}
            <span className="text-accent">prioridad</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-text-muted leading-relaxed">
            Centro médico multidisciplinario en Buenos Aires. Contamos con más de 20 especialidades
            y un equipo de profesionales comprometidos con tu bienestar.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/auth/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-text-inverse font-medium hover:bg-accent-hover transition-colors duration-200"
            >
              <RiCalendarLine />
              Sacá tu turno online
            </Link>
            <a
              href="tel:+541145678900"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-text-muted font-medium hover:bg-surface-alt hover:text-text transition-colors duration-200"
            >
              <RiPhoneLine />
              Llamar ahora
            </a>
          </div>
        </div>
      </section>

      {/* STATS / ABOUT */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <div className="grid gap-8 sm:grid-cols-4 text-center">
            {[
              { value: '+15', label: 'Años de trayectoria', icon: RiShieldStarLine },
              { value: '+20', label: 'Especialidades', icon: RiStethoscopeLine },
              { value: '+50.000', label: 'Pacientes atendidos', icon: RiTeamLine },
              { value: '30+', label: 'Profesionales', icon: RiUserStarLine },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent text-2xl">
                  <s.icon />
                </div>
                <span className="text-3xl font-bold text-text md:text-4xl">{s.value}</span>
                <span className="text-sm text-text-muted">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPECIALTIES */}
      <section id="especialidades" className="bg-bg">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
              Nuestras especialidades
            </h2>
            <p className="mt-4 text-lg text-text-muted max-w-2xl mx-auto">
              Contamos con un equipo interdisciplinario para brindarte la mejor atención en cada área.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {specialties.map((s) => (
              <article
                key={s.title}
                className="group rounded-2xl border border-border bg-surface p-6 transition-all duration-200 hover:border-accent hover:shadow-lg hover:shadow-accent-soft"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent text-xl transition-colors duration-200 group-hover:bg-accent group-hover:text-text-inverse">
                  <s.icon />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-text">{s.title}</h3>
                <p className="mt-2 text-sm text-text-muted leading-relaxed">{s.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* DOCTORS / TEAM */}
      <section id="equipo" className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
              Nuestro equipo médico
            </h2>
            <p className="mt-4 text-lg text-text-muted max-w-2xl mx-auto">
              Profesionales con amplia experiencia y vocación de servicio.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((d) => (
              <article
                key={d.name}
                className="rounded-2xl border border-border bg-bg p-6 transition-all duration-200 hover:shadow-lg hover:shadow-accent-soft"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent text-xl font-bold">
                  {d.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-text">{d.name}</h3>
                <p className="text-sm font-medium text-accent">{d.specialty}</p>
                <p className="mt-1 text-xs text-text-subtle">{d.license}</p>
                <p className="mt-3 text-sm text-text-muted leading-relaxed">{d.bio}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HOW TO BOOK */}
      <section className="bg-bg">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
              ¿Cómo sacar tu turno?
            </h2>
            <p className="mt-4 text-lg text-text-muted">
              Es rápido, fácil y podés hacerlo desde tu casa.
            </p>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {bookingSteps.map((s) => (
              <div key={s.num} className="relative text-center">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-text-inverse text-lg font-bold mb-4">
                  {s.num}
                </span>
                <h3 className="text-lg font-semibold text-text">{s.title}</h3>
                <p className="mt-2 text-sm text-text-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonios" className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
              Lo que dicen nuestros pacientes
            </h2>
            <p className="mt-4 text-lg text-text-muted">
              La confianza de nuestros pacientes es nuestro mayor orgullo.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {testimonials.map((t) => (
              <figure
                key={t.name}
                className="rounded-2xl border border-border bg-bg p-6 transition-all duration-200 hover:shadow-lg hover:shadow-accent-soft"
              >
                <div className="flex gap-0.5 text-warning">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <RiStarFill key={i} />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm text-text-muted leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent text-sm font-bold">
                    {t.name.split(' ').map((w) => w[0]).join('')}
                  </div>
                  <p className="text-sm font-medium text-text">{t.name}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contacto" className="bg-bg">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
              Contacto y ubicación
            </h2>
            <p className="mt-4 text-lg text-text-muted">
              Estamos en el corazón de Buenos Aires, con acceso fácil en transporte público.
            </p>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {/* Info */}
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-5">
                <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent text-lg">
                  <RiMapPin2Line />
                </div>
                <div>
                  <h3 className="font-semibold text-text">Dirección</h3>
                  <p className="mt-1 text-sm text-text-muted">Av. Corrientes 1234, Piso 3, Buenos Aires (CABA)</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-5">
                <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent text-lg">
                  <RiPhoneLine />
                </div>
                <div>
                  <h3 className="font-semibold text-text">Teléfono</h3>
                  <p className="mt-1 text-sm text-text-muted">+54 11 4567-8900</p>
                  <p className="text-xs text-text-subtle">WhatsApp disponible</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-5">
                <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent text-lg">
                  <RiCalendarLine />
                </div>
                <div>
                  <h3 className="font-semibold text-text">Horarios de atención</h3>
                  <p className="mt-1 text-sm text-text-muted">Lunes a Viernes: 8:00 a 20:00</p>
                  <p className="text-sm text-text-muted">Sábados: 8:00 a 14:00</p>
                </div>
              </div>
            </div>
            {/* Map placeholder */}
            <div className="flex items-center justify-center rounded-2xl border border-border bg-surface-alt min-h-[300px]">
              <div className="text-center text-text-muted">
                <RiMapPin2Line className="mx-auto text-4xl mb-3 text-accent" />
                <p className="text-sm">Mapa de ubicación</p>
                <p className="text-xs text-text-subtle">Av. Corrientes 1234, CABA</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
            ¿Necesitás consultar con un especialista?
          </h2>
          <p className="mt-4 text-lg text-text-muted max-w-xl mx-auto">
            Sacá tu turno online en segundos o contactanos por teléfono. Estamos para ayudarte.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/auth/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-text-inverse font-medium hover:bg-accent-hover transition-colors duration-200"
            >
              <RiCalendarLine />
              Reservá tu turno
            </Link>
            <a
              href="tel:+541145678900"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-text-muted font-medium hover:bg-surface-alt hover:text-text transition-colors duration-200"
            >
              <RiPhoneLine />
              +54 11 4567-8900
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
