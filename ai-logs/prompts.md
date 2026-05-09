# MileScape AI Prompts Log


## Prompt 1

You are a senior frontend engineer. Please help me implement the currency and shop system for my React + TypeScript + Vite + Tailwind project called "MileScape".

Important branded terms:
- Paceport is intentional and must not be renamed to Passport
- PaceCrew is the name of the social running group feature
- Stamps is the in-app currency

## Prompt 2

Refactor my MileScape React + TypeScript + Vite + Tailwind project to support a custom feature called Paceport.

## Prompt 3

Please update my MileScape React + TypeScript + Vite + Tailwind project to improve the run distance selection and run completion logic.

## Prompt 4

I want custom distance to appear only when the slider reaches 20 km. If the selected distance exceeds the remaining route progress, show a count such as 2 next to the progress indicator. Do not show 1; keep the current UI for the first lap.

## Prompt 5

After crossing the finish line once, the route progress should reset to 0.

## Prompt 6

Remove the "This run goes..." copy and improve the custom distance UI because the current design feels unattractive.

## Prompt 7

Collapse custom distance by default. Only show a summary row first, then reveal the input after the user opens it. Also check why progress does not change when the progress count becomes 2.

## Prompt 8

Move custom distance out of the main screen and into Settings. Add a custom maximum distance module. For example, if a user sets the maximum to 50 km, the slider should move from 0 to 50 km. Restore the previous short / long slider text.

## Prompt 9

Please help me commit the current changes to GitHub.

## Prompt 10

You are a senior frontend product engineer. Please help me design and implement a new social module for my React + TypeScript + Vite + Tailwind project called "MileScape".

Important branded terms:
- Paceport is intentional and must not be renamed to Passport
- PaceCrew is the name of the social running group feature
- Stamps is the in-app currency

## Prompt 11

I want the PaceCrew module to be split into several pages instead of showing everything on one page. It should work like a home page, with Create, Joined, and Discover pages. Please make the UI cleaner.

## Prompt 12

Please improve the navigation drawer exit logic. After entering from the left drawer, the top-left icon should be an exit/back icon instead of a menu icon, and it should return to the main page. The top-right compass-like icon does not seem useful, so remove it.

## Prompt 13

The Choose Journey page should feel like the main home page. The welcome page should only appear once when entering the app.

## Prompt 14

Optimize Accepted Missions so users can tap into a mission list. If the user enters a lower-level page such as Joined PaceCrews, pressing back should return to the PaceCrew page rather than the app home page.

## Prompt 15

Since each user can only create one organization, adjust the Create PaceCrew logic. If the user has not created a PaceCrew, show a create prompt inside Organizing. After creating one, hide the Create entry on the PaceCrew page. Missions should follow the same logic, and users should manage their organized group from Organizing, including disbanding, leaving, and publishing missions.

## Prompt 16

Did you implement the deposit logic correctly?

## Prompt 17

Clean up all pages and remove unnecessary explanatory text, such as "manage your organized PaceCrew".

## Prompt 18

Allow users to switch the app language between Chinese and English in Settings.

## Prompt 19

Do you know Mapbox GL? I want the reserved image areas for West Lake and Central Park to be replaced with 3D Mapbox GL views. Do you think this is possible?

## Prompt 20

Yes, please help me implement it.

## Prompt 21

Please add the Mapbox token to the environment configuration. [Token removed from public log.]

## Prompt 22

I am not satisfied with the current result. First, can the Mapbox watermark be removed? Second, why is the map black and white? I do not like this style.

## Prompt 23

Please remove Mapbox if necessary. Visually, the map seems to have white borders on both sides, which affects the look, and it does not have a 3D feeling.

## Prompt 24

I do not want a satellite-map feeling. I want a stronger 3D feeling, preferably with green land and blue water. The current style feels too serious. Can the Mapbox watermark be removed?

## Prompt 25

OK.

## Prompt 26

I have two optimisation requests: remove the Hangzhou UI section, and make the map borderless. I do not want the view to feel constrained by a frame. If OpenFreeMap attribution must remain, reduce its visual footprint.

## Prompt 27

Can the OpenFreeMap visual attribution be moved outside the map, below it, or placed near the bottom of the map without a background?

## Prompt 28

Can the map render a loop route? For example, when I select Central Park Loop, it should render the loop road. West Lake should work similarly.

## Prompt 29

Yes.

## Prompt 30

Please roll back to the Mapbox stage. Our design has a problem.

## Prompt 31

Please roll back to the first Mapbox version with the green-water and mountain-like feeling.

## Prompt 32

You are updating an existing React + Vite + Tailwind mobile UI page for the MileScape project.

Goal:
Redesign the current "Choose Journey / West Lake Loop" page into a more Apple-inspired, map-led, immersive mobile interface.

## Prompt 33

I have pushed the project to the remote repository and connected it to Vercel, but it says there is no token. Can you help configure it?

## Prompt 34

You are refactoring the UI of an existing React + Vite + Tailwind mobile app called MileScape.

Important:
- Do NOT redesign or modify the Journey page.
- The Journey page is already approved and should remain unchanged.
- Only refactor these parts:
  1. PaceCrew
  2. Paceport
  3. Side menu / navigation drawer

## Prompt 35

You are a senior frontend mapping/product engineer. Please help me improve the route system in my MileScape project.

Important:
- For this task, focus ONLY on the route-definition and route-visualization problem
- Do NOT refactor the map container into a single persistent Mapbox instance yet
- Do NOT focus on destination switching animation yet
- Only solve the problem of how each destination route is defined, stored, and displayed on the map

## Prompt 36

You are a senior frontend mapping/product engineer. Please improve the route system in my MileScape project, with a strong focus on route realism and avoiding invalid path geometry.

Important:
- For this task, focus ONLY on the destination route definition problem
- Do NOT refactor the whole map lifecycle yet
- Do NOT solve the single persistent Mapbox instance problem yet
- Do NOT focus on destination switching animations yet
- Only solve how destination routes should be defined, stored, and displayed in a believable way

## Prompt 37

Please roll back to the version before adding routes. This technical implementation still has problems.

## Prompt 38

You are refactoring the PaceCrew page of an existing React + Vite + Tailwind mobile app called MileScape.

Important:
- Redesign ONLY the PaceCrew page.
- Do NOT redesign the Journey page.
- The new PaceCrew page should visually align much more closely with the approved Journey page design language.
- Preserve existing functionality and navigation targets as much as possible.
- Focus on layout, hierarchy, interaction presentation, and visual system refinement rather than business logic changes.

## Prompt 39

You are refactoring a mobile page in an existing React + Vite + Tailwind app called MileScape.

Important:
- Redesign ONLY the current PaceCrew page.
- Do NOT redesign the Journey page.
- Preserve existing functionality, routes, and click targets as much as possible.
- Focus on simplifying the internal UI structure and removing the current modular / card-based feeling.
- Do not add unnecessary visual complexity.

## Prompt 40

You are refactoring a mobile page in an existing React + Vite + Tailwind app called MileScape.

Important:
- Redesign ONLY the current PaceCrew page.
- Rename this page from "PaceCrew" to "MileScape Club".
- Do NOT redesign the Journey page.
- Preserve existing functionality and navigation targets as much as possible.
- Focus on improving information architecture, simplifying the page, and replacing the current modular / feature-list feeling with a cleaner product experience.

## Prompt 41

You are refactoring a mobile page in an existing React + Vite + Tailwind app called MileScape.

Important:
- Redesign ONLY the current "MileScape Club" page.
- Do NOT redesign the Journey page.
- Preserve existing functionality, routes, and click targets as much as possible.
- Keep the current Joined / Organizing information architecture.
- The problem is now visual language, not page structure.

## Prompt 42

Make the Joined / Organizing switch feel like Apple's liquid glass style. Simplify the Organizing logic so tapping Organizing directly shows my club details. I do not want a card-based design. Make it as clean and Apple-like as possible. Also update the side-menu entry because it still says PaceCrew.

## Prompt 43

Organizing and Joined should not need internal drawers. At the next level, show all information openly. The design is still not simple enough. Remove obvious redundant information, such as showing "current club count: 1" when a user can only create one organization.


## Prompt 44

请优化 MileScape 的新手引导流程，让第一次进入应用的用户能够理解 Choose Journey、开始跑步、解锁地标和查看奖励的基本路径。

## Prompt 45

请改进成就页面的视觉设计，让已解锁和未解锁的 achievement 状态更加清楚，同时保持整体风格和 Journey 页面一致。

## Prompt 46

请帮我把路线进度和 landmark 解锁逻辑整理清楚：用户完成模拟跑步距离后，需要更新 route progress，并在到达指定距离节点时解锁对应 landmark。

## Prompt 47

请优化 capsule reward 的交互逻辑，确保用户完成路线进度后可以获得奖励，并把 reward 正确加入 inventory、stamps 或 My Scape 相关状态中。

## Prompt 48

请检查 My Scape 的装饰物放置逻辑，用户从 inventory 选择装饰物后，需要保存 placement state，并且刷新页面后仍然能看到已经放置的物品。

## Prompt 49

请优化 PaceCrew 的团队距离贡献逻辑，用户提交跑步距离后，团队总进度、个人贡献和 mission 状态都需要同步更新。

## Prompt 50

请检查中英文切换功能，确保 Settings 中切换语言后，主要页面标题、按钮、路线信息和 PaceCrew 文案都能正确更新。

## Prompt 51

请检查移动端页面的布局细节，重点看按钮文字是否溢出、卡片间距是否一致、底部导航是否遮挡内容，以及不同屏幕宽度下是否仍然可用。
## Prompt 52

你是一个资深前端工程师，请帮我在 MileScape 这个 React + TypeScript + Vite + Tailwind 项目中实现 Stamps 货币和商店系统。请保留 Paceport、PaceCrew、Stamps 这些品牌命名，不要把 Paceport 改成 Passport。

## Prompt 53

请重构 MileScape 项目，让它支持 Paceport 功能。Paceport 应该作为用户查看路线进度、地标收集和奖励记录的核心页面之一。

## Prompt 54

请优化跑步距离选择和完成逻辑。用户拖动距离滑杆后，系统需要根据选择的距离更新路线进度，并在超过终点时正确处理下一轮进度。

## Prompt 55

请把 custom distance 默认收起，只显示一行简洁摘要。用户点开后再显示输入框，不要让主跑步页面一开始就显得太复杂。

## Prompt 56

请把 custom distance 从主界面移动到 Settings 中，增加一个自定义最长距离设置。用户输入最大距离后，主界面的滑杆范围应该跟着更新。

## Prompt 57

请设计一个新的 PaceCrew 社交跑步模块。它需要包含用户已经加入的团队、正在组织的团队、发现团队和创建团队等入口。

## Prompt 58

请优化 PaceCrew 的返回逻辑。用户从 Joined PaceCrews 或 mission 列表进入下一级页面后，点击返回应该回到 PaceCrew 页面，而不是直接回到 app 首页。

## Prompt 59

请调整 Create PaceCrew 的逻辑。因为每个用户只能创建一个团队，所以用户创建成功后，PaceCrew 页面不应该继续显示 Create 入口。

## Prompt 60

请清理 PaceCrew 页面中不必要的说明性文字，只保留用户真正需要操作或理解的信息，让页面看起来更简洁。

## Prompt 61

请在 Settings 中加入语言切换功能，让用户可以在中文和英文之间切换，并确保主要页面文案同步变化。

## Prompt 62

请尝试用 Mapbox GL 替换 West Lake 和 Central Park 路线页中的静态图片区域，让路线展示更接近 3D 地图体验。

## Prompt 63

现在地图视觉不够好，颜色太单调，也缺少 3D 感。请调整地图样式，让它更接近绿地、蓝水和沉浸式路线探索的感觉。

## Prompt 64

请减少地图边框和 attribution 对视觉的干扰，让路线页看起来更无框、更沉浸，不要让地图像被卡片框住一样。

## Prompt 65

请尝试在地图上渲染环线路线。比如用户选择 Central Park Loop 或 West Lake Loop 时，地图上应该出现对应的环线轨迹。

## Prompt 66

请改进路线定义和路线可视化逻辑，重点避免不真实的路线几何形状。每条目的地路线都应该有清晰的数据结构，并能在地图上可信地显示。

## Prompt 67

请只重构 PaceCrew 页面，不要改 Journey 页面。新的 PaceCrew 页面需要更接近已经确认的 Journey 页面视觉风格，同时保留已有功能和跳转入口。

## Prompt 68

请把 MileScape Club 页面里的 Joined 和 Organizing 做得更简洁，不需要层层抽屉。用户点进对应区域后，重要信息应该直接展示出来。

## Prompt 69

请把 Joined / Organizing 的切换做成更接近 Apple 风格的液态玻璃效果，同时更新侧边栏入口名称，避免还显示旧的 PaceCrew 文案。

## Prompt 70

请检查整个移动端应用的交互一致性，包括底部导航、返回按钮、抽屉入口、页面标题和按钮状态，确保用户在不同模块之间切换时不会迷路。
