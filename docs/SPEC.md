# AI-Powered Startup Idea Validator — Mini Spec

## 目标
帮助创业者用 AI 快速验证商业想法可行性，提供市场分析、竞争对手、风险评估和改进建议。

## 核心功能
- **想法输入**：用户输入创业想法描述（一段话或多个要点）
- **AI 分析**：调用 LLM 对想法进行多维度分析
- **可行性报告**：生成包含以下维度的报告：
  - 市场规模评估 (TAM/SAM/SOM)
  - 竞争格局分析
  - 技术可行性
  - 商业模式建议
  - 风险因素
  - 改进建议
  - 综合评分 (0-100)
- **报告分享**：生成可分享的报告链接

## 技术方案
- 前端：React + Vite (TypeScript)
- 后端：Python FastAPI
- AI 调用：通过 llm-proxy.densematrix.ai
- 数据库：SQLite（存储报告）
- 部署：Docker → langsheng

## 端口分配
- Frontend: 30063
- Backend: 30064

## 完成标准
- [x] 核心功能可用（输入想法 → 生成报告）
- [ ] 部署到 idea-validator.demo.densematrix.ai
- [ ] Health check 通过
- [ ] 7 种语言 i18n
- [ ] 支付集成（Creem）
- [ ] 测试覆盖率 ≥ 95%
