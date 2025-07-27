import React from "react"
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { useState } from "react"
import { auth } from "@/lib/firebase"
import { useNavigate, Link } from "react-router-dom"

// Utility function for class names
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// UI Components (inline definitions to avoid import issues)
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => {
  const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variantClasses = {
    default: "bg-black text-white hover:bg-gray-800",
    destructive: "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-gray-300 bg-white hover:bg-gray-50 hover:text-gray-900",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    ghost: "hover:bg-gray-100 hover:text-gray-900",
    link: "text-blue-600 underline-offset-4 hover:underline",
  };
  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };
  return (
    <button
      className={cn(baseClasses, variantClasses[variant || 'default'], sizeClasses[size || 'default'], className)}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn("flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("text-sm font-medium leading-none text-black", className)}
    {...props}
  />
));
Label.displayName = "Label";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-xl border border-gray-200 bg-white shadow-sm", className)}
    {...props}
  />
));
Card.displayName = "Card";

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6", className)} {...props} />
));
CardContent.displayName = "CardContent";

// --- LoginForm Component ---
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Error logging in:", err);
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Error logging in with Google:", err);
      setError(err.message || "Failed to log in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 w-full", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Left Section: Form */}
          <form className="p-6 md:p-8 flex flex-col justify-center" onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-3xl font-extrabold text-black mb-2">BiFyT</h1>
                <p className="text-gray-600">
                  Welcome back to BiFyT
                </p>
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="border-gray-300 focus:border-black focus:ring-black"
                />
              </div>

              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="ml-auto text-sm text-blue-600 underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="border-gray-300 focus:border-black focus:ring-black"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-black text-white hover:bg-gray-800"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              <div className="relative flex items-center justify-center text-xs">
                <span className="absolute left-0 w-full border-t border-gray-300"></span>
                <span className="bg-white text-gray-500 relative z-10 px-2">
                  Or continue with
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  type="button" 
                  className="w-full cursor-pointer" 
                  onClick={handleGoogleLogin} 
                  disabled={loading}
                  aria-label="Sign in with Google"
                >
                  <svg 
                    className="w-5 h-5" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d="M22.54 12.28c0-.77-.07-1.46-.19-2.05H12.48v3.89h5.6c-.24 1.28-.95 2.37-2.09 3.16-.94.67-2.14 1.07-3.48 1.07-2.6 0-4.83-1.6-5.6-3.89-.25-.7-.4-1.47-.4-2.28s.15-1.58.4-2.28c.77-2.29 2.99-3.89 5.6-3.89 1.44 0 2.7.53 3.7 1.48l2.76-2.76C18.75 1.44 16.13 0 12.48 0 5.86 0 .3 5.38.3 12s5.56 12 12.17 12c3.57 0 6.27-1.17 8.37-3.36 2.16-2.16 2.84-5.21 2.84-7.66v-.01z"/>
                  </svg>
                  <span className="sr-only">Sign in with Google</span>
                </Button>
              </div>
              
              <div className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to="/signup" className="text-black underline hover:text-gray-700">
                  Sign up here
                </Link>
              </div>
            </div>
          </form>

          {/* Right Section: Image */}
          <div className="relative hidden md:block min-h-[300px]">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-black mb-2">Welcome Back</h2>
                <p className="text-gray-600">Continue your fitness journey</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-center text-xs text-gray-500">
        By clicking continue, you agree to our <Link to="/terms" className="text-blue-600 underline hover:text-blue-800">Terms of Service</Link>{" "}
        and <Link to="/privacy" className="text-blue-600 underline hover:text-blue-800">Privacy Policy</Link>.
      </div>
    </div>
  );
}

// Wrapper component with navigation
export function Login() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg md:max-w-4xl">
          <LoginForm />
        </div>
      </div>
    </div>
  );
} 