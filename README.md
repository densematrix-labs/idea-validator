# AI-Powered Startup Idea Validator

Validate your startup ideas with AI-powered analysis. Get instant market analysis, competition insights, technical feasibility assessment, and actionable suggestions.

## Features

- **Market Analysis**: TAM/SAM/SOM estimates, market trends, target customer profiles
- **Competition Insights**: Direct/indirect competitors, competitive advantages, barriers
- **Technical Feasibility**: Tech stack recommendations, complexity assessment, MVP timeline
- **Business Model**: Revenue streams, pricing strategy, unit economics, scalability
- **Risk Assessment**: Market, technical, financial, and regulatory risks
- **Actionable Suggestions**: Immediate actions, improvements, pivot ideas

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Python FastAPI
- **AI**: Claude via LLM Proxy
- **Payment**: Creem MoR
- **Deployment**: Docker on langsheng

## Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Testing

```bash
# Backend
cd backend
pytest --cov=app --cov-fail-under=95

# Frontend
cd frontend
npm run test -- --coverage
```

## Deployment

Deployed to: https://idea-validator.demo.densematrix.ai

Ports:
- Frontend: 30063
- Backend: 30064

## License

Proprietary - DenseMatrix Labs
