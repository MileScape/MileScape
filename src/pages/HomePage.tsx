import { type CSSProperties, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/milescape.png";
import { routes } from "../data/routes";
import { cn } from "../utils/cn";
import { formatDistance } from "../utils/progress";

const welcomePages = [
  {
    id: "cover",
  },
  {
    id: "routes",
  },
  {
    id: "collect",
  },
  {
    id: "crew",
  },
] as const;

const welcomePostcards = ["bangkok-floating-route", "seoul-heritage-route"]
  .map((routeId) => routes.find((route) => route.id === routeId))
  .filter((route): route is NonNullable<typeof route> => Boolean(route));

const postcardLayout = [
  "left-[0.2rem] top-[3.7rem] z-10 w-[min(69vw,310px)] sm:left-[8%] sm:top-[12%]",
  "right-[0.2rem] top-[13.2rem] z-20 w-[min(69vw,310px)] sm:right-[8%] sm:top-[34%]",
];
const postcardRotations = ["-5.5deg", "3.8deg"];

export const HomePage = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState(0);
  const [flippedRouteIds, setFlippedRouteIds] = useState<string[]>([]);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const isLastPage = activePage === welcomePages.length - 1;

  const goNext = () => {
    if (isLastPage) {
      navigate("/run/setup");
      return;
    }

    setActivePage((current) => Math.min(current + 1, welcomePages.length - 1));
  };

  const goPrevious = () => {
    setActivePage((current) => Math.max(current - 1, 0));
  };

  const handleTouchEnd = (clientX: number) => {
    if (touchStartX === null) {
      return;
    }

    const deltaX = clientX - touchStartX;
    setTouchStartX(null);

    if (Math.abs(deltaX) < 42) {
      return;
    }

    if (deltaX < 0) {
      goNext();
      return;
    }

    goPrevious();
  };

  const toggleFlipped = (routeId: string) => {
    setFlippedRouteIds((current) =>
      current.includes(routeId) ? current.filter((entry) => entry !== routeId) : [...current, routeId],
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f4ed] text-ink">
      <div className="pointer-events-none absolute left-8 top-0 h-full w-px bg-[#d7b48a]/38" />
      <div className="pointer-events-none absolute left-11 top-0 h-full w-px bg-white/72" />

      <div className="relative z-10 flex min-h-screen flex-col px-7 pb-9 pt-12">
        <div className="flex items-center justify-end font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7a6b58]">
          {activePage > 0 ? (
            <button
              type="button"
              onClick={() => navigate("/run/setup")}
              className="px-1 py-1.5 transition hover:text-[#4f4437] focus:outline-none focus-visible:text-[#4f4437]"
            >
              Skip
            </button>
          ) : (
            <div className="h-[30px]" />
          )}
        </div>

        <div
          className="relative mt-6 flex flex-1 overflow-hidden"
          onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
          onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
        >
          <div
            className="flex w-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(-${activePage * 100}%)` }}
          >
            {welcomePages.map((page, index) => {
              return (
                <section
                  key={page.id}
                  className="flex min-w-full flex-col items-center justify-center text-center"
                  aria-hidden={activePage !== index}
                >
                  {page.id === "cover" ? (
                    <div className="relative h-full w-full">
                      <div className="welcome-cover-logo absolute left-1/2 flex h-64 w-80 items-center justify-center">
                        <img
                          src={logo}
                          alt="MileScape"
                          className="relative h-auto w-80 object-contain"
                        />
                      </div>
                      <p className="welcome-slogan absolute left-1/2 top-[61.8%] max-w-[31ch] text-center font-mono text-[12px] font-medium leading-7 text-[#6b6256]">
                        <span>run locally, explore globally</span>
                      </p>
                    </div>
                  ) : page.id === "routes" ? (
                    <div className="relative h-full w-full overflow-visible">
                      {welcomePostcards.map((route, postcardIndex) => {
                        const isFlipped = flippedRouteIds.includes(route.id);

                        return (
                          <article
                            key={route.id}
                            className={cn(
                              "welcome-postcard-mounted absolute",
                              postcardLayout[postcardIndex],
                              activePage === index && "is-mounted",
                            )}
                            style={
                              {
                                "--welcome-card-drop-rotate": postcardRotations[postcardIndex],
                                animationDelay: `${120 + postcardIndex * 135}ms`,
                              } as CSSProperties
                            }
                          >
                            <div className="pointer-events-none absolute left-1/2 top-[-14px] z-20 h-7 w-24 -translate-x-1/2 rotate-[-4deg] bg-[#e6d5ad]/70 mix-blend-multiply" />
                            <button
                              type="button"
                              onClick={() => toggleFlipped(route.id)}
                              className="relative block w-full text-left transition duration-500 [perspective:1400px] hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7d674d]/45"
                              aria-pressed={isFlipped}
                              aria-label={`Flip ${route.name} postcard`}
                            >
                              <div
                                className={cn(
                                  "relative transition duration-700 [transform-style:preserve-3d]",
                                  isFlipped && "[transform:rotateY(180deg)]",
                                )}
                              >
                                <div className="relative [backface-visibility:hidden]">
                                  <section className="relative overflow-hidden border border-white/70 bg-white">
                                    <div className="relative aspect-[4/5]">
                                      <img
                                        src={route.coverImage}
                                        alt=""
                                        className="absolute inset-0 h-full w-full object-cover"
                                        loading="eager"
                                        decoding="async"
                                        fetchPriority="high"
                                      />
                                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,24,39,0.02)_0%,rgba(17,24,39,0.18)_100%)]" />
                                      <div className="absolute inset-x-4 bottom-4 bg-black/20 px-4 py-3 text-left text-white backdrop-blur-sm">
                                        <p className="text-2xl font-semibold tracking-[-0.05em]">{route.name}</p>
                                      </div>
                                    </div>
                                  </section>
                                </div>

                                <div className="absolute inset-0 flex aspect-[4/5] flex-col justify-between overflow-hidden border border-[#816646]/30 bg-[#f7f1df] p-5 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                                  <div className="pointer-events-none absolute inset-[10px] border border-[#816646]/24" />
                                  <div className="relative">
                                    <h3 className="max-w-[14ch] font-mono text-[1.55rem] font-semibold uppercase leading-[0.98] text-[#263229]/90">
                                      {route.name}
                                    </h3>
                                  </div>

                                  <div className="relative space-y-4">
                                    <div className="border-y border-dashed border-[#816646]/34 py-3">
                                      <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#816646]/72">
                                        Total Route
                                      </p>
                                      <p className="mt-2 font-mono text-[1.9rem] font-semibold leading-none text-[#263229]/90">
                                        {formatDistance(route.totalDistanceKm)}
                                      </p>
                                    </div>
                                    <p className="font-mono text-[0.7rem] font-semibold uppercase leading-5 tracking-[0.15em] text-[#53685f]/74">
                                      Tap to return to the fieldbook cover
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </button>
                          </article>
                        );
                      })}
                      <p
                        className={cn(
                          "absolute bottom-[1.15rem] left-1/2 -translate-x-1/2 whitespace-nowrap text-center font-mono text-[12px] font-semibold tracking-[0.16em] text-[#6b6256] opacity-0 transition-opacity duration-500",
                          activePage === index && "opacity-100",
                        )}
                      >
                        Run. Collect. Remember.
                      </p>
                    </div>
                  ) : (
                    <div className="h-full w-full" />
                  )}
                </section>
              );
            })}
          </div>
        </div>

        {activePage === 0 ? (
          <p className="welcome-cover-footer mt-6 text-center font-mono text-[14px] font-semibold tracking-[0.12em] text-[#6f675c]">
            by CPT208 GROUP C12
          </p>
        ) : null}

        <div
          className={cn(
            "flex items-center justify-center gap-1.5",
            activePage === 0 && "welcome-cover-footer",
            activePage === 0 ? "mt-5" : "mt-6",
          )}
        >
          {welcomePages.map((page, index) => (
            <button
              key={page.id}
              type="button"
              onClick={() => setActivePage(index)}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition",
                activePage === index ? "bg-sage-700" : "bg-sage-300/70",
              )}
              aria-label={`Go to welcome page ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
