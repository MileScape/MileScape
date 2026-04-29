import {
  Award,
  CalendarCheck,
  CheckCircle2,
  Coins,
  Flag,
  Footprints,
  Lock,
  MapPin,
  Route,
  Sparkles,
  Star,
  Trophy,
  Users,
  Watch
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useAppState } from "../hooks/useAppState";

interface AchievementItem {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress: string;
  icon: LucideIcon;
}

const countRunDays = (completedAtValues: string[]) =>
  new Set(
    completedAtValues
      .map((completedAt) => new Date(completedAt))
      .filter((date) => !Number.isNaN(date.getTime()))
      .map((date) => date.toISOString().slice(0, 10)),
  ).size;

export const AchievementsPage = () => {
  const { language, routes, state } = useAppState();
  const runCount = state.runHistory.length;
  const personalRunCount = state.runHistory.filter((run) => run.runTargetType === "personal").length;
  const missionRunCount = state.runHistory.filter((run) => run.runTargetType === "pacecrew_mission").length;
  const runDays = countRunDays(state.runHistory.map((run) => run.completedAt));
  const totalDistanceKm = state.runHistory.reduce((sum, run) => sum + run.distanceKm, 0);
  const longestRunKm = state.runHistory.reduce((longest, run) => Math.max(longest, run.distanceKm), 0);
  const completedRoutes = state.routeProgress.filter((progress) => progress.completed).length;
  const activeRoutes = state.routeProgress.filter(
    (progress) => progress.completedDistanceKm > 0 && !progress.completed,
  ).length;
  const unlockedLandmarks = state.routeProgress.reduce(
    (sum, progress) => sum + progress.unlockedLandmarkIds.length,
    0,
  );
  const totalLandmarks = routes.reduce((sum, route) => sum + route.landmarks.length, 0);
  const decorationCounts = state.routeProgress.flatMap((progress) => Object.values(progress.decorations));
  const totalDecorations = decorationCounts.reduce((sum, count) => sum + count, 0);
  const uniqueDecorations = state.routeProgress.reduce(
    (sum, progress) => sum + Object.values(progress.decorations).filter((count) => count > 0).length,
    0,
  );
  const ownedRouteCount = new Set([...state.purchasedRouteIds, ...state.unlockedCrewDestinationIds]).size;
  const joinedCrewCount = state.userPaceCrewState.memberships.length;
  const acceptedMissionCount = state.userMissionStates.length;
  const completedMissionCount = state.userMissionStates.filter((mission) => mission.status === "completed").length;
  const maxRouteRunCount = state.routeProgress.reduce((max, progress) => Math.max(max, progress.runCount), 0);

  const items: AchievementItem[] = language === "zh"
    ? [
        {
          id: "run-1-day",
          title: "坚持跑步 1 天",
          description: "完成任意一天的跑步记录",
          unlocked: runDays >= 1,
          progress: `${runDays}/1 天`,
          icon: CalendarCheck
        },
        {
          id: "run-3-days",
          title: "坚持跑步 3 天",
          description: "在 3 个不同日期完成跑步",
          unlocked: runDays >= 3,
          progress: `${runDays}/3 天`,
          icon: CalendarCheck
        },
        {
          id: "run-7-days",
          title: "一周跑者",
          description: "在 7 个不同日期留下跑步记录",
          unlocked: runDays >= 7,
          progress: `${runDays}/7 天`,
          icon: CalendarCheck
        },
        {
          id: "first-run",
          title: "第一次出发",
          description: "完成任意一次跑步",
          unlocked: runCount >= 1,
          progress: `${runCount}/1 次`,
          icon: Footprints
        },
        {
          id: "ten-runs",
          title: "稳定节奏",
          description: "累计完成 10 次跑步",
          unlocked: runCount >= 10,
          progress: `${runCount}/10 次`,
          icon: Trophy
        },
        {
          id: "personal-5-runs",
          title: "个人旅程",
          description: "完成 5 次个人路线跑步",
          unlocked: personalRunCount >= 5,
          progress: `${personalRunCount}/5 次`,
          icon: Route
        },
        {
          id: "distance-20",
          title: "累计 20 公里",
          description: "跑步总距离达到 20 公里",
          unlocked: totalDistanceKm >= 20,
          progress: `${Math.floor(totalDistanceKm)}/20 km`,
          icon: Route
        },
        {
          id: "distance-100",
          title: "百公里旅人",
          description: "累计跑步距离达到 100 公里",
          unlocked: totalDistanceKm >= 100,
          progress: `${Math.floor(totalDistanceKm)}/100 km`,
          icon: Award
        },
        {
          id: "long-run-10",
          title: "长距离尝试",
          description: "单次跑步达到 10 公里",
          unlocked: longestRunKm >= 10,
          progress: `${Math.floor(longestRunKm)}/10 km`,
          icon: Footprints
        },
        {
          id: "first-route",
          title: "完成第一条路线",
          description: "完整解锁任意一条路线",
          unlocked: completedRoutes >= 1,
          progress: `${completedRoutes}/1 条`,
          icon: Flag
        },
        {
          id: "three-routes",
          title: "城市收藏家",
          description: "完整解锁 3 条路线",
          unlocked: completedRoutes >= 3,
          progress: `${completedRoutes}/3 条`,
          icon: Flag
        },
        {
          id: "active-3-routes",
          title: "多线探索",
          description: "同时推进 3 条未完成路线",
          unlocked: activeRoutes >= 3,
          progress: `${activeRoutes}/3 条`,
          icon: MapPin
        },
        {
          id: "landmark-10",
          title: "发现 10 个地标",
          description: "累计解锁 10 个路线地标",
          unlocked: unlockedLandmarks >= 10,
          progress: `${unlockedLandmarks}/10 个`,
          icon: MapPin
        },
        {
          id: "all-landmarks",
          title: "完整图鉴",
          description: "解锁所有路线地标",
          unlocked: totalLandmarks > 0 && unlockedLandmarks >= totalLandmarks,
          progress: `${unlockedLandmarks}/${totalLandmarks} 个`,
          icon: Sparkles
        },
        {
          id: "decorations-10",
          title: "装饰收藏",
          description: "累计获得 10 个装饰物",
          unlocked: totalDecorations >= 10,
          progress: `${totalDecorations}/10 个`,
          icon: Star
        },
        {
          id: "unique-decorations-10",
          title: "风格收集者",
          description: "收集 10 种不同装饰物",
          unlocked: uniqueDecorations >= 10,
          progress: `${uniqueDecorations}/10 种`,
          icon: Sparkles
        },
        {
          id: "route-repeat-3",
          title: "熟悉的道路",
          description: "同一条路线累计跑步 3 次",
          unlocked: maxRouteRunCount >= 3,
          progress: `${maxRouteRunCount}/3 次`,
          icon: Trophy
        },
        {
          id: "route-unlock-5",
          title: "目的地解锁",
          description: "拥有 5 条可探索路线",
          unlocked: ownedRouteCount >= 5,
          progress: `${ownedRouteCount}/5 条`,
          icon: Flag
        },
        {
          id: "stamps-100",
          title: "邮票储备",
          description: "累计获得 100 枚邮票",
          unlocked: state.totalStampsEarned >= 100,
          progress: `${state.totalStampsEarned}/100`,
          icon: Coins
        },
        {
          id: "balance-50",
          title: "小金库",
          description: "当前持有 50 枚邮票",
          unlocked: state.currentStamps >= 50,
          progress: `${state.currentStamps}/50`,
          icon: Coins
        },
        {
          id: "join-crew",
          title: "加入 PaceCrew",
          description: "加入任意一个 PaceCrew",
          unlocked: joinedCrewCount >= 1,
          progress: `${joinedCrewCount}/1 个`,
          icon: Users
        },
        {
          id: "mission-accepted",
          title: "接取任务",
          description: "接取任意 PaceCrew 任务",
          unlocked: acceptedMissionCount >= 1,
          progress: `${acceptedMissionCount}/1 个`,
          icon: Users
        },
        {
          id: "mission-complete",
          title: "任务完成",
          description: "完成任意 PaceCrew 任务",
          unlocked: completedMissionCount >= 1,
          progress: `${completedMissionCount}/1 个`,
          icon: Award
        },
        {
          id: "wearable-connected",
          title: "连接设备",
          description: "连接任意运动设备",
          unlocked: Boolean(state.wearableConnection),
          progress: state.wearableConnection ? "1/1" : "0/1",
          icon: Watch
        }
      ]
    : [
        {
          id: "run-1-day",
          title: "Run for 1 day",
          description: "Complete a run on any day",
          unlocked: runDays >= 1,
          progress: `${runDays}/1 day`,
          icon: CalendarCheck
        },
        {
          id: "run-3-days",
          title: "Run for 3 days",
          description: "Complete runs on 3 different dates",
          unlocked: runDays >= 3,
          progress: `${runDays}/3 days`,
          icon: CalendarCheck
        },
        {
          id: "run-7-days",
          title: "One-week runner",
          description: "Run on 7 different dates",
          unlocked: runDays >= 7,
          progress: `${runDays}/7 days`,
          icon: CalendarCheck
        },
        {
          id: "first-run",
          title: "First step out",
          description: "Complete any run",
          unlocked: runCount >= 1,
          progress: `${runCount}/1 run`,
          icon: Footprints
        },
        {
          id: "ten-runs",
          title: "Steady rhythm",
          description: "Complete 10 runs in total",
          unlocked: runCount >= 10,
          progress: `${runCount}/10 runs`,
          icon: Trophy
        },
        {
          id: "personal-5-runs",
          title: "Personal journey",
          description: "Complete 5 personal route runs",
          unlocked: personalRunCount >= 5,
          progress: `${personalRunCount}/5 runs`,
          icon: Route
        },
        {
          id: "distance-20",
          title: "20 km total",
          description: "Reach 20 km of total running distance",
          unlocked: totalDistanceKm >= 20,
          progress: `${Math.floor(totalDistanceKm)}/20 km`,
          icon: Route
        },
        {
          id: "distance-100",
          title: "100 km traveler",
          description: "Reach 100 km of total running distance",
          unlocked: totalDistanceKm >= 100,
          progress: `${Math.floor(totalDistanceKm)}/100 km`,
          icon: Award
        },
        {
          id: "long-run-10",
          title: "Long run attempt",
          description: "Reach 10 km in a single run",
          unlocked: longestRunKm >= 10,
          progress: `${Math.floor(longestRunKm)}/10 km`,
          icon: Footprints
        },
        {
          id: "first-route",
          title: "First route complete",
          description: "Fully unlock any route",
          unlocked: completedRoutes >= 1,
          progress: `${completedRoutes}/1 route`,
          icon: Flag
        },
        {
          id: "three-routes",
          title: "City collector",
          description: "Fully unlock 3 routes",
          unlocked: completedRoutes >= 3,
          progress: `${completedRoutes}/3 routes`,
          icon: Flag
        },
        {
          id: "active-3-routes",
          title: "Multi-route explorer",
          description: "Make progress on 3 unfinished routes",
          unlocked: activeRoutes >= 3,
          progress: `${activeRoutes}/3 routes`,
          icon: MapPin
        },
        {
          id: "landmark-10",
          title: "Discover 10 landmarks",
          description: "Unlock 10 route landmarks in total",
          unlocked: unlockedLandmarks >= 10,
          progress: `${unlockedLandmarks}/10`,
          icon: MapPin
        },
        {
          id: "all-landmarks",
          title: "Complete atlas",
          description: "Unlock every route landmark",
          unlocked: totalLandmarks > 0 && unlockedLandmarks >= totalLandmarks,
          progress: `${unlockedLandmarks}/${totalLandmarks}`,
          icon: Sparkles
        },
        {
          id: "decorations-10",
          title: "Decoration collection",
          description: "Collect 10 decorations in total",
          unlocked: totalDecorations >= 10,
          progress: `${totalDecorations}/10`,
          icon: Star
        },
        {
          id: "unique-decorations-10",
          title: "Style collector",
          description: "Collect 10 different decorations",
          unlocked: uniqueDecorations >= 10,
          progress: `${uniqueDecorations}/10`,
          icon: Sparkles
        },
        {
          id: "route-repeat-3",
          title: "Familiar road",
          description: "Run the same route 3 times",
          unlocked: maxRouteRunCount >= 3,
          progress: `${maxRouteRunCount}/3 runs`,
          icon: Trophy
        },
        {
          id: "route-unlock-5",
          title: "Destination unlocks",
          description: "Own 5 explorable routes",
          unlocked: ownedRouteCount >= 5,
          progress: `${ownedRouteCount}/5 routes`,
          icon: Flag
        },
        {
          id: "stamps-100",
          title: "Stamp reserve",
          description: "Earn 100 stamps in total",
          unlocked: state.totalStampsEarned >= 100,
          progress: `${state.totalStampsEarned}/100`,
          icon: Coins
        },
        {
          id: "balance-50",
          title: "Small treasury",
          description: "Hold 50 stamps at once",
          unlocked: state.currentStamps >= 50,
          progress: `${state.currentStamps}/50`,
          icon: Coins
        },
        {
          id: "join-crew",
          title: "Join PaceCrew",
          description: "Join any PaceCrew",
          unlocked: joinedCrewCount >= 1,
          progress: `${joinedCrewCount}/1 crew`,
          icon: Users
        },
        {
          id: "mission-accepted",
          title: "Accept a mission",
          description: "Accept any PaceCrew mission",
          unlocked: acceptedMissionCount >= 1,
          progress: `${acceptedMissionCount}/1 mission`,
          icon: Users
        },
        {
          id: "mission-complete",
          title: "Mission complete",
          description: "Complete any PaceCrew mission",
          unlocked: completedMissionCount >= 1,
          progress: `${completedMissionCount}/1 mission`,
          icon: Award
        },
        {
          id: "wearable-connected",
          title: "Connect device",
          description: "Connect any fitness device",
          unlocked: Boolean(state.wearableConnection),
          progress: state.wearableConnection ? "1/1" : "0/1",
          icon: Watch
        }
      ];
  const copy = language === "zh"
    ? {
        eyebrow: "Achievements",
        title: "成就",
        description: "记录你的跑步坚持、路线完成、收集进度和 PaceCrew 探索。",
        completed: "已达成",
        locked: "未达成",
        summary: "已达成成就",
        total: "全部成就"
      }
    : {
        eyebrow: "Achievements",
        title: "Achievements",
        description: "A simple record of your consistency, routes, collections, and PaceCrew progress.",
        completed: "Completed",
        locked: "Locked",
        summary: "Completed",
        total: "Total achievements"
      };
  const unlockedCount = items.filter((item) => item.unlocked).length;

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-[26px] bg-white p-4 shadow-card ring-1 ring-sage-100">
          <p className="text-2xl font-semibold text-ink">{unlockedCount}</p>
          <p className="mt-1 text-xs font-medium text-sage-600">{copy.summary}</p>
        </div>
        <div className="rounded-[26px] bg-white p-4 shadow-card ring-1 ring-sage-100">
          <p className="text-2xl font-semibold text-ink">{items.length}</p>
          <p className="mt-1 text-xs font-medium text-sage-600">{copy.total}</p>
        </div>
      </section>

      <section className="space-y-3">
        {items.map(({ id, title, description, unlocked, progress, icon: Icon }) => (
          <article
            key={id}
            className="flex items-center gap-4 rounded-[26px] bg-white p-4 shadow-card ring-1 ring-sage-100"
          >
            <div className={unlocked ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sage-700 text-white" : "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sage-50 text-sage-400"}>
              <Icon className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-ink">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-sage-600">{description}</p>
                </div>
                {unlocked ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sage-700" />
                ) : (
                  <Lock className="mt-0.5 h-5 w-5 shrink-0 text-sage-300" />
                )}
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-sage-500">
                <span>{unlocked ? copy.completed : copy.locked}</span>
                <span>{progress}</span>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};
