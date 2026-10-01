<template>
  <!--
    Bulletproof CSS animasyonlu arka plan.
    WebGL YOK — hiçbir sürücüde siyah ekran olmaz, her tarayıcıda çalışır.
    Akan gradyan + serbest süzülen bulanık gradyan orb'lar (hareket eden şekiller).
  -->
  <div class="anim-bg" aria-hidden="true">
    <div class="anim-bg__gradient"></div>
    <div class="anim-bg__orb anim-bg__orb--1"></div>
    <div class="anim-bg__orb anim-bg__orb--2"></div>
    <div class="anim-bg__orb anim-bg__orb--3"></div>
    <div class="anim-bg__orb anim-bg__orb--4"></div>
    <div class="anim-bg__grain"></div>
    <div class="anim-bg__vignette"></div>
  </div>
</template>

<script setup lang="ts">
// Salt CSS — script mantığı gerektirmiyor.
</script>

<style scoped>
.anim-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  /* Orb'lar başarısız olsa bile arkada güzel bir gradyan garanti */
  background: #0b1020;
}

/* Akan ana gradyan */
.anim-bg__gradient {
  position: absolute;
  inset: -20%;
  background: linear-gradient(
    120deg,
    #0f172a 0%,
    #1e1b4b 25%,
    #312e81 45%,
    #1e3a8a 65%,
    #0e7490 85%,
    #0f172a 100%
  );
  background-size: 300% 300%;
  animation: bgShift 22s ease-in-out infinite;
}

/* Süzülen bulanık orb'lar */
.anim-bg__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.55;
  mix-blend-mode: screen;
  will-change: transform;
}

.anim-bg__orb--1 {
  width: 44vw;
  height: 44vw;
  background: radial-gradient(circle at 30% 30%, #6d28d9, transparent 70%);
  top: -10%;
  left: -5%;
  animation: drift1 26s ease-in-out infinite;
}

.anim-bg__orb--2 {
  width: 38vw;
  height: 38vw;
  background: radial-gradient(circle at 40% 40%, #0891b2, transparent 70%);
  bottom: -12%;
  right: -8%;
  animation: drift2 30s ease-in-out infinite;
}

.anim-bg__orb--3 {
  width: 30vw;
  height: 30vw;
  background: radial-gradient(circle at 50% 50%, #2563eb, transparent 70%);
  top: 35%;
  left: 45%;
  animation: drift3 24s ease-in-out infinite;
}

.anim-bg__orb--4 {
  width: 26vw;
  height: 26vw;
  background: radial-gradient(circle at 50% 50%, #db2777, transparent 70%);
  top: 10%;
  right: 20%;
  opacity: 0.35;
  animation: drift4 34s ease-in-out infinite;
}

/* İnce doku — banding'i kırar, premium his verir */
.anim-bg__grain {
  position: absolute;
  inset: 0;
  opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* Okunabilirlik için kenar karartması */
.anim-bg__vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.45) 100%);
}

@keyframes bgShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes drift1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%      { transform: translate(12vw, 8vh) scale(1.15); }
  66%      { transform: translate(6vw, 18vh) scale(0.95); }
}

@keyframes drift2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%      { transform: translate(-14vw, -6vh) scale(1.1); }
  66%      { transform: translate(-4vw, -16vh) scale(0.9); }
}

@keyframes drift3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%      { transform: translate(-16vw, 10vh) scale(1.2); }
}

@keyframes drift4 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%      { transform: translate(10vw, 14vh) scale(1.1); }
}

/* Hareket hassasiyeti olan kullanıcılar için animasyonları durdur */
@media (prefers-reduced-motion: reduce) {
  .anim-bg__gradient,
  .anim-bg__orb {
    animation: none;
  }
}
</style>
