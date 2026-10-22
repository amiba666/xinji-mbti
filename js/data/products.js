/* ==========================================================================
   商品 / 测评目录（演示数据，原创文案）
   字段见 BUILD-SPEC §4.3
   ========================================================================== */
window.DATA_PRODUCTS = {
  categories: [
    { key: 'all', name: '全部' },
    { key: 'free', name: '免费测试' },
    { key: 'love', name: '爱情婚姻' },
    { key: 'mental', name: '心理健康' },
    { key: 'personality', name: '人格个性' },
    { key: 'career', name: '职场人际' },
    { key: 'family', name: '家庭情感' },
    { key: 'ability', name: '能力潜质' },
    { key: 'values', name: '价值观' }
  ],
  hotKeywords: ['MBTI', '人格', '恋爱', '情商', '压力', '职业', '依恋', '价值观'],
  items: [
    {
      id: 'mbti', title: 'MBTI 人格测试 2026', sub: '2026 年你的人格变了吗？',
      cat: 'personality', price: 9.9, origin: 29.9, count: 987000, hot: true, vip: false,
      tags: ['人格', '性格', 'MBTI'], theme: ['#0f9d62', '#63d9a1'], icon: 'compass',
      desc: '基于荣格心理类型理论改编的 42 题自评量表，从能量来源、信息获取、决策方式、生活态度四个维度，描绘你稳定的人格倾向。结果页会给出 16 型中与你最接近的一种，并展开优势、盲点、亲密关系与职业发展的完整解读。',
      audience: '想更了解自己的性格模式、在关系与工作中反复遇到同类困扰的人。',
      duration: '约 6 分钟', questionCount: 42,
      youGet: ['四维人格倾向可视化图表', '16 型人格完整分析报告', '亲密关系与沟通方式建议', '职业优势与发展方向参考'],
      route: '#/'
    },
    {
      id: 'eq', title: '360° 情商综合评估', sub: '看懂情绪，才能接住关系',
      cat: 'ability', price: 19.9, origin: 39.9, count: 246000, hot: true, vip: true,
      tags: ['情商', '情绪', '关系'], theme: ['#4f6ef7', '#94b0ff'], icon: 'smile',
      desc: '从自我觉察、情绪调节、共情理解、关系经营、压力复原五个维度，评估你在真实情境中的情绪应对方式，给出可执行的练习建议。',
      audience: '容易情绪内耗、在冲突中不知如何表达、希望提升关系质量的人。',
      duration: '约 8 分钟', questionCount: 56,
      youGet: ['五维情商雷达图', '情绪触发点分析', '高情商沟通话术示例', '21 天情绪练习计划']
    },
    {
      id: 'money', title: '财商思维测试', sub: '你和金钱的关系，藏在选择里',
      cat: 'ability', price: 12.9, origin: 29.9, count: 368000, hot: false, vip: true,
      tags: ['财商', '思维', '决策'], theme: ['#c78a17', '#f4c95d'], icon: 'star',
      desc: '通过消费观、风险偏好、长期规划、机会判断四个象限，描绘你的金钱人格，帮助你找到更适合自己的理财节奏。',
      audience: '想建立健康金钱观、改善消费与储蓄习惯的人。',
      duration: '约 7 分钟', questionCount: 48,
      youGet: ['金钱人格画像', '消费盲区提示', '储蓄与风险配置建议', '长期目标拆解模板']
    },
    {
      id: 'love', title: '恋爱体质测试', sub: '测测你是哪种恋爱体质？',
      cat: 'love', price: 9.9, origin: 19.9, count: 1280000, hot: true, vip: false,
      tags: ['恋爱', '吸引力', '关系'], theme: ['#f2608c', '#ffb0c7'], icon: 'heart',
      desc: '从依恋倾向、表达习惯、亲密需求、冲突模式四个角度，识别你的恋爱体质类型，理解自己在关系里的靠近与退缩。',
      audience: '陷入恋爱循环、想理解自己为何反复心动或受伤的人。',
      duration: '约 5 分钟', questionCount: 36,
      youGet: ['恋爱体质类型卡', '吸引力来源拆解', '冲突时的沟通模板', '适配伴侣特质清单']
    },
    {
      id: 'age', title: '心理年龄测试', sub: '你的心，今年几岁？',
      cat: 'mental', price: 6.9, origin: 19.9, count: 764000, hot: false, isNew: true, vip: false,
      tags: ['心理年龄', '成长', '心态'], theme: ['#f08a4b', '#ffc79b'], icon: 'sun',
      desc: '用 30 个日常选择还原你的心理年龄，并解释这份「年龄感」如何影响你的好奇、责任与亲密方式。',
      audience: '好奇自己心态成熟度、想找回轻盈感的人。',
      duration: '约 4 分钟', questionCount: 30,
      youGet: ['心理年龄结果卡', '成熟度与童心指数', '心态调节建议', '同龄人对比数据']
    },
    {
      id: 'career', title: '职场性格与岗位匹配', sub: '你在什么位置最发光？',
      cat: 'career', price: 19.9, origin: 49.9, count: 543000, hot: false, vip: true,
      tags: ['职场', '性格', '发展'], theme: ['#2f6fd0', '#7fb2ff'], icon: 'target',
      desc: '结合工作风格、协作偏好、压力反应与价值排序，匹配更适合你的岗位环境与团队角色，给出可落地的成长路径。',
      audience: '面临转岗、跳槽、职业倦怠，或想找到定位的职场人。',
      duration: '约 9 分钟', questionCount: 60,
      youGet: ['岗位环境匹配度', '团队角色画像', '优势发展建议', '跳槽决策清单']
    },
    {
      id: 'nine', title: '九型人格测试', sub: '看见你的核心动机',
      cat: 'personality', price: 12.9, origin: 29.9, count: 382000, hot: false, vip: false,
      tags: ['九型', '动机', '成长'], theme: ['#7a5cc4', '#b9a4f2'], icon: 'sparkle',
      desc: '九型人格关注「你为什么这么做」，通过 45 道情境题识别你的核心动机、防御机制与成长方向。',
      audience: '想理解自己行为背后动机、减少内耗的人。',
      duration: '约 7 分钟', questionCount: 45,
      youGet: ['主型与侧翼判断', '压力/放松状态解析', '关系相处指南', '成长路径建议']
    },
    {
      id: 'gallup', title: '优势识别器', sub: '把天赋用在正确的地方',
      cat: 'career', price: 24.9, origin: 59.9, count: 231000, hot: false, vip: true,
      tags: ['优势', '天赋', '成长'], theme: ['#0e8c7f', '#63d6c6'], icon: 'leaf',
      desc: '从执行力、影响力、关系建立、战略思维四大领域，识别你的前五优势主题，帮助你把精力放在回报最高的地方。',
      audience: '希望摆脱「补短板」焦虑、找到个人长板的人。',
      duration: '约 10 分钟', questionCount: 66,
      youGet: ['前五优势主题', '优势组合解读', '优势使用场景', '短板管理策略']
    },
    {
      id: 'iq', title: '瑞文智力专业评估', sub: '测一下你有多聪明？',
      cat: 'ability', price: 39.9, origin: 79.0, count: 4217000, hot: true, vip: false,
      tags: ['智力', '逻辑', '推理'], theme: ['#3d5a80', '#8fb3d9'], icon: 'target',
      desc: '基于瑞文推理测验思路改编的图形推理题组，评估你的抽象推理与问题解决能力，并给出分维度表现。',
      audience: '好奇自己的推理能力、喜欢逻辑挑战的人。',
      duration: '约 12 分钟', questionCount: 30,
      youGet: ['推理能力分维度得分', '同龄段百分位参考', '能力优势说明', '训练建议']
    },
    {
      id: 'social', title: '社交焦虑自评', sub: '人多的场合，你还好吗？',
      cat: 'mental', price: 0, origin: 19.9, count: 152000, hot: false, vip: false, free: true,
      tags: ['社交', '焦虑', '自评'], theme: ['#5380c2', '#a9c6ee'], icon: 'user',
      desc: '用 28 道贴近日常的题目，评估你在社交情境中的紧张程度与回避倾向，并给出温和可执行的改善步骤。',
      audience: '在聚会、发言、陌生人场合容易紧张的人。',
      duration: '约 4 分钟', questionCount: 28,
      youGet: ['社交焦虑程度评估', '常见触发情境', '呼吸与放松练习', '渐进式暴露清单']
    },
    {
      id: 'family', title: '原生家庭影响评估', sub: '理解来处，才更自由',
      cat: 'family', price: 19.9, origin: 39.9, count: 88000, hot: false, vip: true,
      tags: ['家庭', '成长', '关系'], theme: ['#9a6b4f', '#dcb79c'], icon: 'home',
      desc: '从情感回应、边界模式、冲突处理、期待传递四个维度，梳理原生家庭对你的影响，并给出温和的分离与重建建议。',
      audience: '在亲密关系或自我价值上反复受困、想理解家庭影响的人。',
      duration: '约 8 分钟', questionCount: 52,
      youGet: ['家庭互动模式图谱', '影响路径解析', '边界建立练习', '自我重建建议']
    },
    {
      id: 'values', title: '人生价值观排序', sub: '什么对你真的重要？',
      cat: 'values', price: 9.9, origin: 19.9, count: 66000, hot: false, isNew: true, vip: false,
      tags: ['价值观', '选择', '人生'], theme: ['#6b7f3f', '#c3d69b'], icon: 'compass',
      desc: '在 20 组两难选择中，帮你排出属于自己的价值优先级，减少在人生岔路口的摇摆。',
      audience: '面临重要选择、总觉得「什么都想要」的人。',
      duration: '约 5 分钟', questionCount: 20,
      youGet: ['核心价值观排序', '冲突价值解析', '决策参考框架', '年度目标建议']
    },
    {
      id: 'stress', title: '压力与情绪状态自测', sub: '最近，你还好吗？',
      cat: 'mental', price: 0, origin: 19.9, count: 205000, hot: false, vip: false, free: true,
      tags: ['压力', '情绪', '自测'], theme: ['#5f7d95', '#b9cddd'], icon: 'moon',
      desc: '12 个问题快速了解近两周的压力水平与情绪状态，并给出可立即使用的舒缓方法。',
      audience: '睡眠变差、容易烦躁、感觉被掏空的人。',
      duration: '约 2 分钟', questionCount: 12,
      youGet: ['压力水平评分', '情绪状态提示', '3 分钟舒缓练习', '求助资源建议']
    },
    {
      id: 'attachment', title: '依恋类型测试', sub: '你在关系里，如何靠近？',
      cat: 'love', price: 0, origin: 29.9, count: 173000, hot: false, vip: false, free: true,
      tags: ['依恋', '亲密关系', '模式'], theme: ['#c2547e', '#f0a8c4'], icon: 'heart',
      desc: '依据依恋理论的四种类型，帮你看清自己在亲密关系中的靠近方式、安全感来源与触发点。',
      audience: '在关系里忽冷忽热、害怕被抛弃或害怕被需要的人。',
      duration: '约 4 分钟', questionCount: 32,
      youGet: ['依恋类型判定', '关系模式解析', '安全感练习', '伴侣沟通建议']
    },
    {
      id: 'sleep', title: '睡眠质量评估', sub: '今晚，好好睡一觉',
      cat: 'mental', price: 9.9, origin: 19.9, count: 41000, hot: false, isNew: true, vip: false,
      tags: ['睡眠', '作息', '健康'], theme: ['#3b4a7a', '#8f9fd1'], icon: 'moon',
      desc: '从入睡、维持、早醒、日间功能四个维度评估你的睡眠质量，输出可执行的作息调整方案。',
      audience: '入睡困难、多梦易醒、白天疲惫的人。',
      duration: '约 5 分钟', questionCount: 24,
      youGet: ['睡眠质量评分', '作息问题定位', '睡前放松流程', '两周改善计划']
    },
    {
      id: 'communication', title: '沟通风格测试', sub: '你的话，别人听懂了吗？',
      cat: 'career', price: 9.9, origin: 19.9, count: 97000, hot: false, isNew: true, vip: false,
      tags: ['沟通', '表达', '协作'], theme: ['#2d7d8a', '#87cfd8'], icon: 'wechat',
      desc: '识别你在表达、倾听、反馈、冲突四个环节的默认风格，找到最容易被误解的地方。',
      audience: '经常「说了等于没说」、在协作中反复摩擦的人。',
      duration: '约 6 分钟', questionCount: 40,
      youGet: ['沟通风格画像', '误解高发场景', '表达结构模板', '冲突沟通步骤']
    }
  ]
};
