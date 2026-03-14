import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('UI Crash:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black text-white p-12 flex items-center justify-center">
                    <div className="max-w-xl text-center space-y-6">
                        <div className="text-red-500 text-6xl font-bold">!</div>
                        <h1 className="text-2xl font-bold">MailRadar has encountered a runtime error.</h1>
                        <p className="text-muted-foreground bg-white/5 p-4 rounded-lg border border-red-500/20 font-mono text-sm text-left overflow-auto max-h-48">
                            {this.state.error?.toString()}
                        </p>
                        <button 
                            onClick={() => {
                                localStorage.removeItem('gmail_token');
                                window.location.href = '/';
                            }}
                            className="btn-primary"
                        >
                            Reset Session & Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
