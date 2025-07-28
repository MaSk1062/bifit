import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Target, 
  TrendingUp, 
  Users, 
  Zap, 
  Heart,
  ArrowRight,
  Play
} from 'lucide-react';

export const LandingPage = () => {
  const { currentUser } = useAuth();

  const features = [
    {
      icon: <Activity className="h-6 w-6 text-black" />,
      title: "Activity Tracking",
      description: "Track your workouts, steps, and daily activities with precision."
    },
    {
      icon: <Target className="h-6 w-6 text-black" />,
      title: "Goal Management",
      description: "Set and achieve your fitness goals with personalized tracking."
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-black" />,
      title: "Progress Analytics",
      description: "Visualize your progress with detailed charts and insights."
    },
    {
      icon: <Heart className="h-6 w-6 text-black" />,
      title: "Health Monitoring",
      description: "Monitor your heart rate, sleep, and overall health metrics."
    },
    {
      icon: <Users className="h-6 w-6 text-black" />,
      title: "Community Support",
      description: "Connect with like-minded fitness enthusiasts and share progress."
    },
    {
      icon: <Zap className="h-6 w-6 text-black" />,
      title: "Smart Recommendations",
      description: "Get personalized workout and nutrition recommendations."
    }
  ];

  if (currentUser) {
    // Authenticated user view
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-black mb-4">
              Welcome back, {currentUser.displayName || currentUser.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Ready to continue your fitness journey? Jump back into tracking your progress and achieving your goals.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/dashboard">
                <Button size="lg" className="bg-black hover:bg-gray-800 text-white px-8 py-3">
                  <Play className="mr-2 h-5 w-5" />
                  Go to Dashboard
                </Button>
              </Link>
              
              <Link to="/activity/new">
                <Button variant="outline" size="lg" className="px-8 py-3 border-black text-black hover:bg-black hover:text-white">
                  <Activity className="mr-2 h-5 w-5" />
                  Log Activity
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow border-gray-200">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-black" />
                </div>
                <CardTitle className="text-black">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Quick access to your most used features</p>
                <Link to="/workouts">
                  <Button variant="outline" size="sm" className="w-full border-black text-black hover:bg-black hover:text-white">
                    Manage Workouts
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-gray-200">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-black" />
                </div>
                <CardTitle className="text-black">Your Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Track and update your fitness goals</p>
                <Link to="/goals">
                  <Button variant="outline" size="sm" className="w-full border-black text-black hover:bg-black hover:text-white">
                    View Goals
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-gray-200">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-black" />
                </div>
                <CardTitle className="text-black">Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">View your progress and insights</p>
                <Link to="/analytics">
                  <Button variant="outline" size="sm" className="w-full border-black text-black hover:bg-black hover:text-white">
                    View Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated user view
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-black">BiFyT</span>
          </div>
          <div className="flex space-x-4">
            <Link to="/login">
              <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-black hover:bg-gray-800 text-white">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-black mb-6">
            Transform Your
            <span className="text-gray-600"> Fitness Journey</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Track your workouts, monitor your progress, and achieve your fitness goals with our comprehensive health and wellness platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/signup">
              <Button size="lg" className="bg-black hover:bg-gray-800 text-white px-8 py-3">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link to="/login">
              <Button variant="outline" size="lg" className="px-8 py-3 border-black text-black hover:bg-black hover:text-white">
                Already have an account? Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow border-gray-200">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-black">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gray-50 rounded-2xl p-8 shadow-lg border border-gray-200">
          <h2 className="text-3xl font-bold text-black mb-4">
            Ready to Start Your Fitness Journey?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of users who have transformed their lives with BiFyT. 
            Start tracking your progress today and achieve your fitness goals.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-black hover:bg-gray-800 text-white px-8 py-3">
              Create Your Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600">
        <p>&copy; 2024 BiFyT. All rights reserved.</p>
      </footer>
    </div>
  );
}; 