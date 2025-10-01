# Porada - Legal AI Assistant

A sophisticated contract analysis platform built with React, TypeScript, and Tailwind CSS. Porada provides professional-grade legal document analysis with AI-powered risk assessment and comprehensive reporting.

## 🚀 Features

### Core Functionality
- **Document Upload**: Drag & drop interface with file validation
- **AI Analysis**: Automated contract analysis with risk assessment
- **Risk Visualization**: Color-coded risk levels and detailed breakdowns
- **Results Dashboard**: Comprehensive analysis results with recommendations
- **History Management**: Search and filter through past analyses
- **Export Capabilities**: PDF reports and shareable links

### User Experience
- **Professional Design**: Conservative, trustworthy aesthetic for legal professionals
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation
- **Real-time Feedback**: Loading states, progress indicators, and notifications

### Security & Trust
- **Enterprise-grade Security**: Visual indicators of data protection
- **Confidentiality Controls**: Document classification and access management
- **Audit Trail**: Complete history of analyses and actions

## 🎨 Design System

### Color Palette
- **Primary**: Deep Navy (#1a365d) - Trust, authority, stability
- **Secondary**: Professional Blue (#2b77e6) - Technology, reliability
- **Accent**: Legal Gold (#d69e2e) - Premium, expertise, highlights
- **Success**: Forest Green (#38a169) - Approval, safe decisions
- **Warning**: Amber (#ed8936) - Caution, medium risk
- **Danger**: Professional Red (#e53e3e) - High risk, critical issues

### Typography
- **Headings**: Inter (modern, clean, authoritative)
- **Body**: Source Sans Pro (readable, professional)
- **Code/Legal**: JetBrains Mono (monospace for legal references)

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for styling with custom design system
- **React Router** for navigation
- **React Hook Form** for form management
- **React Query** for data fetching and caching
- **Framer Motion** for smooth animations
- **Recharts** for data visualization

### Development Tools
- **Vite** for fast development and building
- **ESLint** for code quality
- **TypeScript** strict mode for type safety
- **PostCSS** with Autoprefixer

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LegalAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── UI/             # Basic UI components (Button, Card, etc.)
│   ├── Layout/         # Layout components (Header, Sidebar)
│   ├── Dashboard/      # Dashboard-specific components
│   ├── Notification/   # Notification system
│   └── User/           # User-related components
├── pages/              # Page components
│   ├── Dashboard/      # Main dashboard
│   ├── DocumentUpload/ # File upload interface
│   ├── AnalysisResults/ # Analysis results display
│   ├── History/        # Analysis history
│   └── Settings/       # User settings
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── styles/             # Global styles and CSS
```

## 🎯 Key Components

### Document Upload
- Drag & drop file upload with validation
- Support for PDF, DOC, DOCX, and TXT files
- Real-time upload progress
- Error handling and user feedback

### Analysis Dashboard
- Risk level indicators with color coding
- Statistics and metrics overview
- Recent analyses with quick access
- Interactive charts and visualizations

### Results Visualization
- Detailed clause-by-clause analysis
- Risk assessment with explanations
- Recommendations and action items
- Export functionality for reports

### History & Archives
- Search and filter capabilities
- Sort by date, risk level, or status
- Bulk operations and export
- Responsive table and card views

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://api.porada.com
VITE_APP_NAME=Porada
VITE_APP_VERSION=1.0.0
```

### Tailwind Configuration
The project uses a custom Tailwind configuration with:
- Extended color palette for legal branding
- Custom typography scales
- Professional spacing and border radius
- Custom animations and transitions

## 🚀 Deployment

### Build Process
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment Options
- **Vercel**: Zero-config deployment with automatic builds
- **Netlify**: Drag & drop deployment or Git integration
- **AWS S3**: Static hosting with CloudFront CDN
- **Docker**: Containerized deployment option

## 📱 Responsive Design

The application is built mobile-first with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

All components are fully responsive with appropriate touch targets and navigation patterns.

## ♿ Accessibility

- **WCAG 2.1 AA Compliant**: Meets accessibility standards
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels and roles
- **Color Contrast**: Meets contrast ratio requirements
- **Focus Management**: Clear focus indicators

## 🔒 Security Considerations

- **Input Validation**: Client-side validation for file uploads
- **XSS Protection**: Sanitized content rendering
- **CSRF Protection**: Token-based form submissions
- **Content Security Policy**: Strict CSP headers
- **Secure Headers**: Security-focused HTTP headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Use functional components with hooks
- Implement proper error boundaries
- Write accessible components
- Follow the established design system

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Email**: support@porada.com
- **Documentation**: [docs.porada.com](https://docs.porada.com)
- **Issues**: GitHub Issues for bug reports

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core application structure
- ✅ Document upload and analysis
- ✅ Results visualization
- ✅ History management

### Phase 2 (Planned)
- 🔄 Advanced analytics and reporting
- 🔄 Team collaboration features
- 🔄 API integration
- 🔄 Advanced export options

### Phase 3 (Future)
- 📋 Mobile applications
- 📋 AI model improvements
- 📋 Enterprise integrations
- 📋 Advanced security features

---

Built with ❤️ for legal professionals who demand excellence in contract analysis.
