import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/milescape.png";
import { cn } from "../utils/cn";

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

export const HomePage = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState(0);
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
                  ) : (
                    <div className="h-full w-full" />
                  )}
                </section>
              );
            })}
          </div>
        </div>

        <p
          className={cn(
            "mt-6 text-center font-mono text-[14px] font-semibold tracking-[0.12em] text-[#6f675c]",
            activePage === 0 && "welcome-cover-footer",
          )}
        >
          by CPT208 GROUP C12
        </p>

        <div
          className={cn(
            "mt-5 flex items-center justify-center gap-1.5",
            activePage === 0 && "welcome-cover-footer",
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
