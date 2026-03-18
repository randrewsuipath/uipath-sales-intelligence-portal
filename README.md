# UiPath Sales Intelligence Portal

A professional sales-facing dashboard for UiPath Sales Directors and leadership to monitor cloud platform utilisation across their customer accounts. The portal surfaces critical account health metrics by reading real-time data from Snowflake via UiPath Data Fabric entities, presenting unattended robot utilisation, AI unit consumption, and agentic automation adoption in a clean, actionable interface.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/randrewsuipath/uipath-sales-intelligence-portal)

## Overview

The UiPath Sales Intelligence Portal enables sales teams to proactively engage customers before renewal risk materialises. The system identifies at-risk accounts through a composite risk scoring algorithm that evaluates utilisation trends, licence expiry proximity, and account value. The portal features configurable thresholds, drill-down account views with ownership attribution (Account Director, TAM, CSM), trend visualisations, and recommended next actions, all optimised for rapid decision-making in a commercial context.

## Key Features

- **Executive Dashboard**: High-level overview with key metrics cards showing total accounts, at-risk count, revenue exposure, and average utilisation across robot, AI, and agentic categories
- **Account Risk List**: Comprehensive filterable table with multi-column sorting, search, and filter controls for risk level, utilisation thresholds, expiry date ranges, account owner, and region
- **Account Detail View**: Drill-down page for single accounts showing detailed utilisation breakdowns, historical trend charts, licence inventory, ownership team details, and recommended next actions
- **Settings & Configuration**: Administrative interface for configuring risk thresholds, managing account ownership assignments, and adjusting display preferences
- **Real-time Data Integration**: Direct integration with UiPath Data Fabric Entities service for live account utilisation metrics
- **Composite Risk Scoring**: Intelligent risk calculation based on utilisation trends, licence expiry proximity, and account value
- **Responsive Design**: Professional enterprise aesthetic optimised for desktop and mobile devices

## Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components built on Radix UI

### State Management & Data
- **Zustand** - Lightweight state management
- **date-fns** - Modern date utility library
- **Recharts** - Composable charting library for data visualisation

### UiPath Integration
- **@uipath/uipath-typescript** - Official UiPath SDK for TypeScript
- OAuth authentication with UiPath Cloud
- Direct integration with Data Fabric Entities service

### Deployment
- **Cloudflare Pages** - Global edge deployment
- **Cloudflare Workers** - Serverless compute platform

## Prerequisites

- [Bun](https://bun.sh/) v1.0 or higher
- UiPath Cloud account with appropriate permissions
- UiPath Data Fabric access with Snowflake integration configured

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd uipath-sales-intelligence-portal
```

2. Install dependencies:

```bash
bun install
```

3. Configure environment variables:

Create a `.env` file in the project root with your UiPath credentials:

```env
VITE_UIPATH_BASE_URL=https://api.uipath.com
VITE_UIPATH_ORG_NAME=your-org-name
VITE_UIPATH_TENANT_NAME=your-tenant-name
VITE_UIPATH_CLIENT_ID=your-client-id
VITE_UIPATH_REDIRECT_URI=http://localhost:3000
VITE_UIPATH_SCOPE=DataFabric.Data.Read DataFabric.Schema.Read
```

**Required OAuth Scopes:**
- `DataFabric.Data.Read` - Read entity records
- `DataFabric.Schema.Read` - Read entity schemas

4. Start the development server:

```bash
bun run dev
```

The application will be available at `http://localhost:3000`

## Data Setup

### Snowflake Integration

The portal expects a UiPath Data Fabric entity named `AccountUtilisationMetrics` with the following schema:

| Field Name | Type | Description |
|------------|------|-------------|
| accountId | UUID | Unique account identifier |
| accountName | string | Account display name |
| region | string | Geographic region |
| accountDirector | string | Assigned Account Director |
| tam | string | Technical Account Manager |
| csm | string | Customer Success Manager |
| arr | decimal | Annual Recurring Revenue |
| robotLicences | integer | Total robot licences |
| robotUtilisationPct | decimal | Robot utilisation percentage (0-100) |
| aiUnitsLicenced | integer | Total AI units licenced |
| aiUtilisationPct | decimal | AI utilisation percentage (0-100) |
| agenticLicences | integer | Total agentic licences |
| agenticUtilisationPct | decimal | Agentic utilisation percentage (0-100) |
| licenceExpiryDate | datetime | Licence expiration date |
| lastSyncTime | datetime | Last data sync timestamp |

### Configuration Entity

A separate `PortalConfig` entity stores threshold values and configuration:

| Field Name | Type | Description |
|------------|------|-------------|
| robotLowUtilisationThreshold | decimal | Low utilisation threshold for robots (default: 20) |
| aiLowUtilisationThreshold | decimal | Low utilisation threshold for AI (default: 20) |
| agenticLowUtilisationThreshold | decimal | Low utilisation threshold for agentic (default: 15) |
| expiryWarningDays | integer | Days before expiry to show warning (default: 90) |
| riskScoreWeights | JSON | Composite risk score calculation weights |

## Development

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── layout/         # Layout components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── pages/              # Page components
└── utils/              # Helper functions
```

### Available Scripts

- `bun run dev` - Start development server with hot reload
- `bun run build` - Build production bundle
- `bun run preview` - Preview production build locally
- `bun run lint` - Run ESLint for code quality checks

### Code Quality

The project uses:
- **ESLint** - Code linting with TypeScript support
- **TypeScript** - Static type checking
- **Prettier** (via ESLint) - Code formatting

### Adding New Features

1. Create feature components in `src/components/`
2. Add page routes in `src/main.tsx`
3. Implement data fetching using UiPath SDK in `src/hooks/`
4. Update risk scoring logic in `src/utils/riskScoring.ts`

## Deployment

### Cloudflare Pages

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/randrewsuipath/uipath-sales-intelligence-portal)

#### Manual Deployment

1. Build the project:

```bash
bun run build
```

2. Deploy to Cloudflare Pages:

```bash
npx wrangler pages deploy dist
```

#### Automatic Deployment

Connect your repository to Cloudflare Pages for automatic deployments:

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** → **Create a project**
3. Connect your Git repository
4. Configure build settings:
   - **Build command**: `bun run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
5. Add environment variables from your `.env` file
6. Deploy

### Environment Variables

Set the following environment variables in Cloudflare Pages settings:

- `VITE_UIPATH_BASE_URL`
- `VITE_UIPATH_ORG_NAME`
- `VITE_UIPATH_TENANT_NAME`
- `VITE_UIPATH_CLIENT_ID`
- `VITE_UIPATH_REDIRECT_URI` (set to your production URL)
- `VITE_UIPATH_SCOPE`

## Usage

### Authentication

1. Navigate to the application URL
2. Click the login button to authenticate with UiPath Cloud
3. Grant the requested OAuth permissions
4. You will be redirected back to the dashboard

### Executive Dashboard

The main dashboard displays:
- **Total Accounts** - Count of all monitored accounts
- **At-Risk Accounts** - Accounts with high composite risk scores
- **Revenue at Risk** - Total ARR from at-risk accounts
- **Average Utilisation** - Mean utilisation across all metrics

The ranked risk table shows the top 20 at-risk accounts, sortable by:
- Composite risk score
- Utilisation trend
- Expiry proximity
- Account value (ARR)

### Account Risk List

Filter accounts by:
- **Risk Level**: Critical, High, Medium, Low
- **Utilisation Thresholds**: Custom percentage ranges
- **Expiry Date Range**: Specific date windows
- **Account Owner**: Account Director, TAM, CSM
- **Region**: Geographic regions

Sort by any column and use the search bar for quick account lookup.

### Account Detail View

Click any account to view:
- **Utilisation Breakdown**: Robot, AI, and agentic metrics
- **Trend Charts**: 30/60/90-day historical views
- **Licence Inventory**: All licences with expiry dates
- **Ownership Team**: Account Director, TAM, CSM details
- **Activity Timeline**: Recent account events
- **Recommended Actions**: Risk-based next steps

Export account summaries as PDF for meeting preparation.

### Settings

Configure:
- **Risk Thresholds**: Adjust low utilisation percentages
- **Expiry Warning Window**: Days before expiry to flag accounts
- **Risk Score Weights**: Customise composite risk calculation
- **Account Ownership**: Assign or update ownership

## Risk Scoring Algorithm

The composite risk score (0-100) is calculated as:

```
risk = (1 - avgUtilisation) × 0.4 
     + trendPenalty × 0.3 
     + expiryProximity × 0.2 
     + (arr / maxArr) × 0.1
```

Where:
- **avgUtilisation**: Mean of robot, AI, and agentic utilisation
- **trendPenalty**: Negative trend over 60 days (0-1)
- **expiryProximity**: Days until expiry normalised (0-1)
- **arr / maxArr**: Account value relative to highest ARR

Risk levels:
- **Critical**: Score ≥ 75
- **High**: Score 50-74
- **Medium**: Score 25-49
- **Low**: Score < 25

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Security

- OAuth 2.0 authentication with UiPath Cloud
- Token-based session management
- Secure credential storage in sessionStorage
- HTTPS required for production deployments

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software developed for UiPath sales operations.

## Support

For issues or questions:
- Open an issue in the repository
- Contact the development team
- Refer to [UiPath SDK documentation](https://docs.uipath.com/)

---

Built with ❤️ using React, TypeScript, and the UiPath SDK