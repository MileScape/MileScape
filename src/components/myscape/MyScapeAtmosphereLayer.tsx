interface MyScapeAtmosphereLayerProps {
  activeEffectIds: string[];
}

const snowflakes = Array.from({ length: 18 }, (_, index) => ({
  id: `snow-${index}`,
  left: `${(index * 17 + 8) % 100}%`,
  delay: `${(index % 6) * -0.7}s`,
  duration: `${6 + (index % 5) * 0.7}s`,
  size: `${5 + (index % 4)}px`,
}));

const petals = Array.from({ length: 16 }, (_, index) => ({
  id: `petal-${index}`,
  left: `${(index * 23 + 4) % 100}%`,
  delay: `${(index % 7) * -0.55}s`,
  duration: `${7 + (index % 5) * 0.6}s`,
}));

export const MyScapeAtmosphereLayer = ({ activeEffectIds }: MyScapeAtmosphereLayerProps) => {
  const activeEffects = new Set(activeEffectIds);
  const hasSnow = activeEffects.has("snowfall");
  const hasDusk = activeEffects.has("dusk-skybox");
  const hasSakura = activeEffects.has("sakura-fall");
  const hasTurf = activeEffects.has("custom-turf");

  if (!hasSnow && !hasDusk && !hasSakura && !hasTurf) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-[12] overflow-hidden" aria-hidden="true">
      {hasDusk ? (
        <div className="absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_6%,rgba(255,212,151,0.48)_0%,rgba(237,159,122,0.22)_38%,rgba(99,118,154,0.12)_72%,rgba(99,118,154,0)_100%)] mix-blend-multiply" />
      ) : null}

      {hasTurf ? (
        <div className="absolute inset-x-[-15%] bottom-[16%] h-[46%] bg-[radial-gradient(65%_42%_at_50%_52%,rgba(91,145,94,0.22)_0%,rgba(104,169,112,0.14)_48%,rgba(104,169,112,0)_72%)]" />
      ) : null}

      {hasSnow ? (
        <div className="absolute inset-0">
          {snowflakes.map((flake) => (
            <span
              key={flake.id}
              className="myscape-snowflake absolute top-[-10%] rounded-full bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.72)]"
              style={{
                left: flake.left,
                width: flake.size,
                height: flake.size,
                animationDelay: flake.delay,
                animationDuration: flake.duration,
              }}
            />
          ))}
        </div>
      ) : null}

      {hasSakura ? (
        <div className="absolute inset-0">
          {petals.map((petal) => (
            <span
              key={petal.id}
              className="myscape-sakura-petal absolute top-[-8%] h-3 w-2 rounded-[999px_999px_999px_0] bg-[#efb7bd]/80 shadow-[0_0_10px_rgba(236,160,177,0.26)]"
              style={{
                left: petal.left,
                animationDelay: petal.delay,
                animationDuration: petal.duration,
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};
