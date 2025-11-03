export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8 animate-fade-in">
          <img
            src="/logo.svg"
            alt="Mubarak Way"
            className="h-32 w-auto"
          />
        </div>

        <h1 className="text-3xl font-bold mb-4 text-text-primary animate-fade-in" style={{ animationDelay: '100ms' }}>
          Mubarak Way
        </h1>
        <p className="text-lg text-text-secondary mb-2 animate-fade-in" style={{ animationDelay: '200ms' }}>
          Благословенный путь
        </p>
        <p className="text-text-tertiary mb-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
          Добро пожаловать в единую исламскую платформу
        </p>
        <button className="btn btn-primary w-full animate-fade-in" style={{ animationDelay: '400ms' }}>
          Начать
        </button>
      </div>
    </div>
  );
}
