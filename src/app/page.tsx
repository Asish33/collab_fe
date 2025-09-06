"use client";
import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Users,
  Brain,
  FileText,
  Zap,
  CheckCircle,
  ArrowRight,
  PenTool,
  MessageSquare,
  BookOpen,
  Star,
  Shield,
  Clock,
  ChevronDown,
  Sparkles,
  Target,
  TrendingUp,
  Globe,
  Award,
  Heart,
  ThumbsUp,
  Quote,
  Plus,
  Minus,
} from "lucide-react";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();
  const [activeFeature, setActiveFeature] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev: number) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to top functionality and content reveal
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const features = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Real-time Collaboration",
      description:
        "Work together seamlessly with live cursors, instant updates, and synchronized editing across all devices.",
    },
    {
      icon: <Brain className="h-8 w-8 text-purple-600" />,
      title: "AI-Powered Assistance",
      description:
        "Ask questions, get suggestions, and enhance your notes with intelligent AI integration.",
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "Smart Quiz Generation",
      description:
        "Automatically generate quizzes from your notes to test knowledge and reinforce learning.",
    },
    {
      icon: <FileText className="h-8 w-8 text-green-600" />,
      title: "Rich Text Editing",
      description:
        "Create beautiful documents with formatting, images, links, and advanced typography options.",
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-indigo-600" />,
      title: "Interactive Notes",
      description:
        "Add comments, highlights, and annotations to make your notes more engaging and informative.",
    },
    {
      icon: <BookOpen className="h-8 w-8 text-red-600" />,
      title: "Knowledge Management",
      description:
        "Organize, search, and manage all your notes in one centralized, intelligent workspace.",
    },
  ];

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "50K+", label: "Notes Created" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      company: "TechCorp",
      content:
        "NoteCollab transformed how our team collaborates. The real-time editing and AI suggestions have made our meetings 3x more productive.",
      avatar: "SC",
      rating: 5,
    },
    {
      name: "Marcus Johnson",
      role: "Student",
      company: "Stanford University",
      content:
        "The quiz generation feature is incredible! It helped me ace my finals by creating practice tests from my study notes automatically.",
      avatar: "MJ",
      rating: 5,
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Research Director",
      company: "Innovation Labs",
      content:
        "The AI assistance is like having a research partner. It suggests relevant topics and helps organize complex information beautifully.",
      avatar: "ER",
      rating: 5,
    },
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for individuals getting started",
      features: [
        "Up to 10 notes",
        "Basic collaboration",
        "Standard AI assistance",
        "Basic quiz generation",
        "Community support",
      ],
      cta: "Get Started Free",
      popular: false,
    },
    {
      name: "Pro",
      price: "$12",
      period: "per month",
      description: "Best for teams and power users",
      features: [
        "Unlimited notes",
        "Advanced collaboration",
        "Premium AI features",
        "Advanced quiz generation",
        "Priority support",
        "Team management",
        "Export options",
      ],
      cta: "Start Pro Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For large organizations",
      features: [
        "Everything in Pro",
        "Custom integrations",
        "Dedicated support",
        "Advanced security",
        "Custom branding",
        "API access",
        "SLA guarantee",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  const faqs = [
    {
      question: "How does real-time collaboration work?",
      answer:
        "Our platform uses WebSocket technology to sync changes instantly across all connected users. You'll see live cursors, real-time updates, and seamless collaboration without any delays.",
    },
    {
      question: "Can I use NoteCollab offline?",
      answer:
        "Yes! NoteCollab works offline and automatically syncs your changes when you reconnect to the internet. Your notes are always available, even without an internet connection.",
    },
    {
      question: "How accurate is the AI quiz generation?",
      answer:
        "Our AI analyzes your notes' content and structure to generate relevant, high-quality quiz questions. The accuracy rate is over 95% based on user feedback and testing.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Absolutely. We use end-to-end encryption, comply with GDPR and SOC 2 standards, and never share your data with third parties. Your notes are private and secure.",
    },
    {
      question: "Can I export my notes?",
      answer:
        "Yes! You can export your notes in multiple formats including PDF, Markdown, Word, and plain text. Pro users get additional export options and batch export capabilities.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <PenTool className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold text-white">NoteCollab</span>
            </div>
            <div className="flex items-center space-x-4">
              {status === "authenticated" ? (
                <Link href="/dashboard">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={() =>
                    signIn("google", { callbackUrl: "/dashboard" })
                  }
                  disabled={status === "loading"}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {status === "loading" ? "Loading…" : "Get Started"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative">
          {/* Floating badges */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-full px-4 py-2 text-sm text-slate-300">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span>AI-Powered • Real-time • Secure</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Collaborate, Create, and
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient">
              {" "}
              Learn Together
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            The ultimate note-taking platform that combines real-time
            collaboration, AI assistance, and intelligent quiz generation to
            supercharge your learning and productivity.
          </p>

          {/* Enhanced CTA button */}
          <div className="flex justify-center mb-12">
            <Button
              size="lg"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              disabled={status === "loading"}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xl px-12 py-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-xl"
            >
              {status === "loading" ? "Loading…" : "Start Creating Notes"}
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-400" />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-400" />
              <span>Global Availability</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-400" />
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className={`py-20 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          isScrolled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to take better notes
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Powerful features designed to enhance your note-taking experience
              and boost productivity.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-slate-800/70"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        className={`py-20 bg-gradient-to-r from-slate-800 to-slate-700 transition-all duration-1000 delay-200 ${
          isScrolled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Loved by thousands of users worldwide
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              See what our community is saying about NoteCollab
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-slate-800/70"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-slate-300">{testimonial.role}</p>
                    <p className="text-xs text-slate-400">
                      {testimonial.company}
                    </p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <blockquote className="text-slate-200 italic">
                  <Quote className="h-4 w-4 text-slate-400 inline mr-1" />
                  {testimonial.content}
                </blockquote>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How it Works
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Get started in minutes and transform your note-taking workflow.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Create & Collaborate
              </h3>
              <p className="text-slate-300">
                Start a new note or join an existing one. Invite team members
                for real-time collaboration.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Enhancement</h3>
              <p className="text-slate-300">
                Ask questions, get suggestions, and let AI help you create
                better, more comprehensive notes.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Quiz & Learn</h3>
              <p className="text-slate-300">
                Generate quizzes from your notes to test knowledge and reinforce
                learning outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        className={`py-20 bg-slate-800 transition-all duration-1000 delay-400 ${
          isScrolled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Choose the plan that's right for you. Upgrade or downgrade at any
              time.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-slate-900/70 ${
                  plan.popular ? "ring-2 ring-blue-500 scale-105" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-white">
                      {plan.price}
                    </span>
                    <span className="text-slate-300 ml-2">{plan.period}</span>
                  </div>
                  <p className="text-slate-300">{plan.description}</p>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-slate-200">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full py-3 ${
                    plan.popular
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      : "bg-slate-700 hover:bg-slate-600 text-white"
                  }`}
                  onClick={() => {
                    if (plan.name === "Free" || plan.name === "Pro") {
                      signIn("google", { callbackUrl: "/dashboard" });
                    }
                  }}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        className={`py-20 bg-slate-900 transition-all duration-1000 delay-600 ${
          isScrolled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-300">
              Everything you need to know about NoteCollab
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg overflow-hidden hover:bg-slate-800/70 transition-colors"
              >
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-700/50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-semibold text-white">
                    {faq.question}
                  </span>
                  {openFaq === index ? (
                    <Minus className="h-5 w-5 text-slate-400" />
                  ) : (
                    <Plus className="h-5 w-5 text-slate-400" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-slate-300 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to revolutionize your note-taking?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who are already creating, collaborating, and
            learning more effectively.
          </p>
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              disabled={status === "loading"}
              className="bg-white text-blue-600 hover:bg-blue-50 text-xl px-12 py-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-xl"
            >
              {status === "loading" ? "Loading…" : "Get Started Free"}
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <PenTool className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">NoteCollab</span>
              </div>
              <p className="text-slate-400 mb-4 max-w-md">
                The future of collaborative note-taking. Create, collaborate,
                and learn together with AI-powered features.
              </p>
              <div className="flex space-x-4">
                <div className="flex items-center text-slate-400">
                  <Shield className="h-4 w-4 mr-2 text-blue-400" />
                  <span className="text-sm">Secure & Private</span>
                </div>
                <div className="flex items-center text-slate-400">
                  <Clock className="h-4 w-4 mr-2 text-green-400" />
                  <span className="text-sm">Real-time Sync</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Product</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/editor"
                    className="hover:text-white transition-colors"
                  >
                    Editor
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">
                Features
              </h3>
              <ul className="space-y-2 text-slate-400">
                <li>Real-time Collaboration</li>
                <li>AI Assistance</li>
                <li>Quiz Generation</li>
                <li>Rich Text Editing</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-500">
            <p>&copy; 2024 NoteCollab. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-50 border border-slate-600"
          aria-label="Scroll to top"
        >
          <ArrowRight className="h-5 w-5 rotate-[-90deg]" />
        </button>
      )}
    </div>
  );
}
