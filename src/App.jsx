import React, { useState } from 'react';
import Login from './components/Login';
import { Upload, Camera, Mic, ScanBarcode, Heart, Activity, TrendingUp, Users, MessageCircle, AlertTriangle, Eye, Shield, Lock, BarChart3, PieChart, Sparkles, Star, Trophy, Zap, Leaf, Brain, Target, CheckCircle, Menu, X, FileText, BookOpen, ForkKnife, Coffee, Utensils, Moon, Apple, Plus, ArrowLeft, Flame, Droplet, Circle, ChevronDown, HeartPulse, Info, Clipboard, Calendar, Clock, ChartLine, List, Database, Ruler, Scale, Bot, RefreshCw, LogOut, User, Bell, Settings, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NutrixoLogo from './assets/nutrixo-logo.png';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // User Profile State
  const [user, setUser] = useState({
    name: 'Diego',
    email: 'diego@nutrixo.com',
    avatar: null
  });
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileProfile, setShowMobileProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileNotifications, setShowMobileNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Análise Concluída', description: 'Sua análise de Vitamina D está pronta.', type: 'labs', target: 'labs', time: '2 min', read: false },
    { id: 2, title: 'Hora do Almoço', description: 'Não se esqueça de registrar sua refeição.', type: 'food', target: 'food', time: '1h', read: false },
    { id: 3, title: 'Meta Atingida!', description: 'Parabéns! Você bateu sua meta de água.', type: 'success', target: 'dashboard', time: '3h', read: true }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markNotificationAsRead = (id, targetTab) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (targetTab) setActiveTab(targetTab);
    setTimeout(() => {
      setShowNotifications(false);
      setShowMobileNotifications(false);
    }, 200);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowProfileMenu(false);
    setShowMobileProfile(false);
    setShowNotifications(false);
    setShowMobileNotifications(false);
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [dailyCalories, setDailyCalories] = useState(2000);
  const [consumedCalories, setConsumedCalories] = useState(850);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [planUploaded, setPlanUploaded] = useState(false);
  const [recipeSuggestions, setRecipeSuggestions] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('day');
  const [showMealTypeSelector, setShowMealTypeSelector] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('');
  const [mealLog, setMealLog] = useState([
    { id: 1, type: 'Café da manhã', calories: 350, time: '08:30', emoji: '☕' },
    { id: 2, type: 'Almoço', calories: 500, time: '13:15', emoji: '🍱' },
    { id: 3, type: 'Lanche', calories: 0, time: '16:00', emoji: '🍎' }
  ]);
  const [nutritionPlanText, setNutritionPlanText] = useState('');
  const [selectedCardapioType, setSelectedCardapioType] = useState('today');
  const [showProgressSubmenu, setShowProgressSubmenu] = useState('biomarkers');
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, type: 'ai', message: 'Olá! Sou seu assistente de saúde Nutrixo. Como posso ajudar você hoje? 💡' }
  ]);
  const [userInput, setUserInput] = useState('');

  // Macro nutrients data
  const [macroNutrients, setMacroNutrients] = useState({
    protein: { consumed: 78, goal: 120, unit: 'g' },
    carbs: { consumed: 156, goal: 250, unit: 'g' },
    fats: { consumed: 42, goal: 65, unit: 'g' }
  });

  // Recent Insights
  const recentInsights = [
    {
      id: 1,
      title: "Níveis de Ferro",
      description: "Seus níveis de ferro estão dentro da faixa ótima. Continue com alimentos ricos em ferro.",
      type: "positive"
    },
    {
      id: 2,
      title: "Dica do Dia",
      description: "Adicione mais proteína no almoço para atingir sua meta diária.",
      type: "tip"
    },
    {
      id: 3,
      title: "Vitamina D",
      description: "Seus níveis de vitamina D estão abaixo do ideal. Considere suplementação e exposição ao sol.",
      type: "warning"
    }
  ];

  // Progress Data
  const examHistory = [
    {
      id: 1,
      date: "14/01/2024",
      status: "Atenção",
      optimal: 2,
      attention: 1,
      improve: 1
    },
    {
      id: 2,
      date: "19/10/2023",
      status: "Ótimo",
      optimal: 3,
      attention: 1,
      improve: 0
    },
    {
      id: 3,
      date: "09/07/2023",
      status: "Melhorar",
      optimal: 1,
      attention: 2,
      improve: 1
    }
  ];

  const biomarkerTrends = [
    {
      id: 1,
      name: "Colesterol Total",
      reference: "< 200 mg/dL",
      current: "210 mg/dL",
      trend: "Melhorando",
      values: [
        { value: 230, date: "2023-07" },
        { value: 215, date: "2023-10" },
        { value: 210, date: "2024-01" }
      ]
    },
    {
      id: 2,
      name: "Glicose",
      reference: "< 100 mg/dL",
      current: "95 mg/dL",
      trend: "Estável",
      values: [
        { value: 98, date: "2023-07" },
        { value: 96, date: "2023-10" },
        { value: 95, date: "2024-01" }
      ]
    },
    {
      id: 3,
      name: "Hemoglobina",
      reference: "12-16 g/dL",
      current: "14.2 g/dL",
      trend: "Ótimo",
      values: [
        { value: 13.8, date: "2023-07" },
        { value: 14.0, date: "2023-10" },
        { value: 14.2, date: "2024-01" }
      ]
    }
  ];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file.name);
      // Simulate AI analysis
      setTimeout(() => {
        setAnalysisResult({
          vitaminD: { value: 28, normal: '30-100', status: 'low' },
          iron: { value: 120, normal: '60-170', status: 'normal' },
          cholesterol: { value: 220, normal: '100-200', status: 'high' }
        });
      }, 2000);
    }
  };

  const takePhoto = () => {
    // Simulate photo calorie estimation
    const estimatedCalories = Math.floor(Math.random() * 300) + 200;
    setConsumedCalories(prev => prev + estimatedCalories);

    // Add to meal log
    const newMeal = {
      id: Date.now(),
      type: selectedMealType,
      calories: estimatedCalories,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      emoji: getEmojiForMealType(selectedMealType)
    };

    setMealLog(prev => [...prev, newMeal]);
    setShowMealTypeSelector(false);
    setSelectedMealType('');
  };

  const uploadNutritionPlan = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file.name);
      // Simulate plan parsing and recipe generation
      setTimeout(() => {
        setPlanUploaded(true);
        generateRecipeSuggestions();
      }, 2000);
    }
  };


  const MEAL_DATABASE = {
    morning: [
      { name: "Café da Manhã com Mandioca e Ovos", calories: 420, protein: 24, carbs: 45, fats: 15, ingredients: ["Mandioca cozida (150g)", "Ovo de galinha (4 unidades)", "Requeijão Cremoso Light (30g)"] },
      { name: "Tapioca com Frango e Queijo", calories: 380, protein: 22, carbs: 40, fats: 12, ingredients: ["Goma de tapioca (60g)", "Frango desfiado (80g)", "Queijo Cottage (30g)"] },
      { name: "Panqueca de Banana e Aveia", calories: 400, protein: 18, carbs: 55, fats: 10, ingredients: ["Banana (1 un)", "Ovo (2 un)", "Aveia (30g)", "Mel (1 fio)"] },
      { name: "Ovos Mexidos com Pão Integral", calories: 350, protein: 20, carbs: 30, fats: 14, ingredients: ["Pão integral (2 fatias)", "Ovos (3 un)", "Manteiga (5g)"] }
    ],
    lunch: [
      { name: "Almoço Balanceado com Frango", calories: 680, protein: 45, carbs: 60, fats: 18, ingredients: ["Peito de frango (140g)", "Arroz intregral (90g)", "Feijão (140g)", "Salada"] },
      { name: "Carne Moída com Purê de Batata", calories: 720, protein: 40, carbs: 65, fats: 22, ingredients: ["Carne moída (150g)", "Batata inglesa (200g)", "Legumes cozidos"] },
      { name: "Peixe Grelhado com Legumes", calories: 550, protein: 40, carbs: 30, fats: 15, ingredients: ["Tilápia (150g)", "Brócolis e cenoura (200g)", "Arroz (80g)"] },
      { name: "Strogonoff Light de Frango", calories: 650, protein: 42, carbs: 55, fats: 20, ingredients: ["Frango em cubos (150g)", "Creme de ricota light", "Arroz (100g)"] }
    ],
    snack: [
      { name: "Lanche Proteico com Banana e Whey", calories: 320, protein: 28, carbs: 35, fats: 5, ingredients: ["Banana (2 un)", "Whey Protein (30g)", "Aveia (15g)"] },
      { name: "Iogurte com Frutas e Granola", calories: 300, protein: 15, carbs: 40, fats: 8, ingredients: ["Iogurte natural (170g)", "Morango (5 un)", "Granola (20g)"] },
      { name: "Sanduíche de Atum", calories: 350, protein: 25, carbs: 30, fats: 10, ingredients: ["Pão integral (2 fatias)", "Atum (1 lata)", "Maionese light"] },
      { name: "Shake de Abacate e Cacau", calories: 400, protein: 10, carbs: 20, fats: 30, ingredients: ["Abacate (100g)", "Leite (200ml)", "Cacau em pó"] }
    ],
    dinner: [
      { name: "Jantar com Mandioca e Frango", calories: 450, protein: 35, carbs: 40, fats: 12, ingredients: ["Mandioca (150g)", "Frango (150g)"] },
      { name: "Omelete de Forno com Legumes", calories: 380, protein: 25, carbs: 10, fats: 20, ingredients: ["Ovos (3 un)", "Espinafre", "Tomate", "Queijo branco"] },
      { name: "Sopa de Legumes com Carne", calories: 300, protein: 20, carbs: 30, fats: 8, ingredients: ["Carne em cubos (100g)", "Legumes variados", "Macarrão (50g)"] },
      { name: "Salada Completa com Frango", calories: 350, protein: 30, carbs: 15, fats: 15, ingredients: ["Mix de folhas", "Frango desfiado (120g)", "Azeite (1 fio)"] }
    ],
    supper: [
      { name: "Ceia Sanduíche Integral", calories: 380, protein: 25, carbs: 30, fats: 10, ingredients: ["Pão integral (2 fatias)", "Frango (100g)", "Requeijão"] },
      { name: "Mingau de Aveia Proteico", calories: 300, protein: 20, carbs: 35, fats: 5, ingredients: ["Aveia (30g)", "Whey (1 scoop)", "Canela"] },
      { name: "Mix de Castanhas", calories: 200, protein: 5, carbs: 10, fats: 15, ingredients: ["Castanha do Pará (2 un)", "Nozes (2 un)", "Amêndoas (5 un)"] },
      { name: "Queijo Coalho com Orégano", calories: 250, protein: 15, carbs: 2, fats: 20, ingredients: ["Queijo Coalho (2 fatias)", "Orégano", "Azeite"] }
    ]
  };

  const getRandomMeal = (type) => {
    const options = MEAL_DATABASE[type];
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
  };

  const generateRecipeSuggestions = () => {
    const recipes = [
      { id: 1, ...getRandomMeal('morning'), time: "Manhã", type: 'morning' },
      { id: 2, ...getRandomMeal('lunch'), time: "Almoço", type: 'lunch' },
      { id: 3, ...getRandomMeal('snack'), time: "Tarde", type: 'snack' },
      { id: 4, ...getRandomMeal('dinner'), time: "Jantar", type: 'dinner' },
      { id: 5, ...getRandomMeal('supper'), time: "Noite", type: 'supper' }
    ];
    setRecipeSuggestions(recipes);
  };

  const regenerateSingleMeal = (id, type) => {
    const newMeal = getRandomMeal(type);
    setRecipeSuggestions(prev => prev.map(meal =>
      meal.id === id ? { ...meal, ...newMeal } : meal
    ));
  };


  const getEmojiForMealType = (type) => {
    switch (type) {
      case 'Café da manhã':
        return '☕';
      case 'Almoço':
        return '🍱';
      case 'Jantar':
        return '🌙';
      case 'Lanche':
        return '🍎';
      default:
        return '🍽️';
    }
  };

  const addMealByVoice = (text) => {
    // Simulate voice recognition
    const estimatedCalories = Math.floor(Math.random() * 300) + 200;
    setConsumedCalories(prev => prev + estimatedCalories);

    // Add to meal log
    const newMeal = {
      id: Date.now(),
      type: selectedMealType,
      calories: estimatedCalories,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      emoji: getEmojiForMealType(selectedMealType),
      voiceNote: text
    };

    setMealLog(prev => [...prev, newMeal]);
    setShowMealTypeSelector(false);
    setSelectedMealType('');
  };

  const addMealByBarcode = (barcode) => {
    // Simulate barcode scanning
    const estimatedCalories = Math.floor(Math.random() * 300) + 200;
    setConsumedCalories(prev => prev + estimatedCalories);

    // Add to meal log
    const newMeal = {
      id: Date.now(),
      type: selectedMealType,
      calories: estimatedCalories,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      emoji: getEmojiForMealType(selectedMealType),
      barcode: barcode
    };

    setMealLog(prev => [...prev, newMeal]);
    setShowMealTypeSelector(false);
    setSelectedMealType('');
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim() === '') return;

    const userMessage = { id: Date.now(), type: 'user', message: userInput };
    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = { id: Date.now() + 1, type: 'ai', message: 'Entendi! Com base nas suas informações, recomendo focar em aumentar a ingestão de proteínas e manter-se hidratado. 🥤' };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3, emoji: '📊', label: 'Dashboard' },
    { id: 'labs', name: 'Exames', icon: Activity, emoji: '🧪', label: 'Exames' },
    { id: 'measurements', name: 'Medidas', icon: Ruler, emoji: '📏', label: 'Medidas' },
    { id: 'progress', name: 'Progresso', icon: TrendingUp, emoji: '📈', label: 'Progresso' },
    { id: 'nutrition-plan', name: 'Plano Alimentar', icon: FileText, emoji: '🍽️', label: 'Plano Alimentar' },
    { id: 'food', name: 'Alimentação', icon: Camera, emoji: '🥗', label: 'Alimentação' }
  ];

  const healthMetrics = [
    { name: 'Vitamina D', value: '28 ng/mL', status: 'Abaixo do normal', trend: 'up', emoji: '💊' },
    { name: 'Ferro', value: '120 µg/dL', status: 'Normal', trend: 'stable', emoji: '🩸' },
    { name: 'Colesterol', value: '220 mg/dL', status: 'Acima do normal', trend: 'down', emoji: '⚠️' }
  ];

  const totalTodayCalories = mealLog.reduce((sum, meal) => sum + meal.calories, 0);


  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Nutrixo
              </h1>
            </div>

            {/* Desktop Navigation - Centered */}
            <div className="hidden lg:flex flex-grow justify-center">
              <div className="flex items-center gap-2">
                {tabs.map((tab) => {
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      whileHover={{ y: -1, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className={`relative flex items-center space-x-2 px-5 py-3 h-11 rounded-full font-bold text-sm tracking-tight border transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 select-none ${activeTab === tab.id
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-transparent text-white shadow-md shadow-cyan-500/25 ring-1 ring-black/5'
                        : 'bg-white/80 border-gray-200/60 text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 hover:shadow-sm'
                        }`}
                    >
                      <span className={`text-base leading-none filter ${activeTab === tab.id ? 'drop-shadow-sm' : ''} transition-transform duration-200 group-hover:scale-110`}>{tab.emoji}</span>
                      <span className="hidden xl:inline">{tab.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Desktop Right Actions (Profile & Notifications) */}
            <div className="hidden lg:flex items-center space-x-5">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-400 hover:text-cyan-600 transition-colors rounded-full hover:bg-gray-50 focus:outline-none"
                  aria-label="Notificações"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[60] origin-top-right"
                    >
                      <div className="p-4 border-b border-gray-50 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 text-sm">Notificações</h3>
                        {unreadCount > 0 && (
                          <button onClick={markAllNotificationsAsRead} className="text-xs text-cyan-600 hover:text-cyan-800 font-medium flex items-center">
                            <Check className="w-3 h-3 mr-1" /> Marcar lidas
                          </button>
                        )}
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-500 text-sm">
                            Nenhuma notificação.
                          </div>
                        ) : (
                          notifications.map(notification => (
                            <div
                              key={notification.id}
                              onClick={() => markNotificationAsRead(notification.id, notification.target)}
                              className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors flex items-start space-x-3 ${!notification.read ? 'bg-cyan-50/30' : ''}`}
                            >
                              <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notification.read ? 'bg-cyan-500' : 'bg-transparent'}`}></div>
                              <div className="flex-1">
                                <p className={`text-sm ${!notification.read ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.description}</p>
                                <p className="text-[10px] text-gray-400 mt-2">{notification.time}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-1 pl-2 pr-3 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  <div className="text-left hidden xl:block">
                    <p className="text-xs font-bold text-gray-700 leading-none">{user.name}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Desktop Dropdown */}
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[60] origin-top-right"
                    >
                      <div className="p-5 border-b border-gray-50 bg-gradient-to-br from-gray-50 to-white">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[160px]">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2 space-y-1">
                        <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors group">
                          <div className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                            <User className="w-4 h-4 text-gray-500 group-hover:text-cyan-600" />
                          </div>
                          <span>Meu Perfil</span>
                        </button>
                        <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors group">
                          <div className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                            <Settings className="w-4 h-4 text-gray-500 group-hover:text-cyan-600" />
                          </div>
                          <span>Configurações</span>
                        </button>
                        <div className="h-px bg-gray-100 my-1 mx-2"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors group"
                        >
                          <div className="p-1.5 bg-red-50 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                            <LogOut className="w-4 h-4 text-red-500" />
                          </div>
                          <span>Sair da Conta</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile Menu & Profile */}
            <div className="lg:hidden flex items-center space-x-3">
              <button
                onClick={() => setShowMobileNotifications(true)}
                className="relative p-2 text-gray-400 hover:text-cyan-600 transition-colors rounded-full hover:bg-gray-50 focus:outline-none"
                aria-label="Notificações"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border border-white flex items-center justify-center">
                    <span className="text-[8px] text-white font-bold leading-none">{unreadCount}</span>
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowMobileProfile(true)}
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white active:scale-95 transition-transform"
              >
                {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full" /> : user.name.charAt(0)}
              </button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden bg-white border-t border-gray-100 py-4"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap justify-center gap-2">
                {tabs.map((tab) => {
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMenuOpen(false);
                      }}
                      whileTap={{ scale: 0.96 }}
                      className={`flex items-center space-x-2 px-4 py-3 rounded-full font-bold transition-all duration-200 border w-full text-sm ${activeTab === tab.id
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-transparent text-white shadow-md'
                        : 'bg-white border-gray-200 text-slate-600'
                        }`}
                    >
                      <span className="text-lg">{tab.emoji}</span>
                      <span className="text-xs font-bold uppercase tracking-wide">{tab.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 lg:pb-8 pt-4">
        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 xl:grid-cols-3 gap-6"
          >
            {/* Health Overview */}
            <div className="xl:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-gray-900">
                    🧬 Visão Geral de Saúde
                  </h2>
                  <TrendingUp className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="space-y-3">
                  {healthMetrics.map((metric, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-cyan-300 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{metric.emoji}</span>
                        <div>
                          <h3 className="font-bold text-base text-gray-900">{metric.name}</h3>
                          <p className="text-gray-500 text-sm">{metric.value}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-xs font-bold ${metric.status.includes('Abaixo') ? 'bg-red-100 text-red-700 border border-red-200' :
                        metric.status.includes('Acima') ? 'bg-red-100 text-red-700 border border-red-200' :
                          'bg-green-100 text-green-700 border border-green-200'
                        }`}>
                        {metric.status}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Macro Nutrients Overview */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-gray-900">📊 Nutrientes Diários</h2>
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Calories */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <Flame className="w-5 h-5 text-orange-600" />
                      <h3 className="font-medium text-gray-900">Calorias</h3>
                    </div>
                    <div className="mb-2">
                      <span className="text-2xl font-bold text-gray-900">{consumedCalories}</span>
                      <span className="text-gray-600 ml-1">/ {dailyCalories}</span>
                    </div>
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 rounded-full bg-gray-200">
                        <div
                          style={{ width: `${(consumedCalories / dailyCalories) * 100}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-600"
                        ></div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      {dailyCalories - consumedCalories} cal restantes
                    </div>
                  </div>

                  {/* Protein */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <Droplet className="w-5 h-5 text-blue-600" />
                      <h3 className="font-medium text-gray-900">Proteína</h3>
                    </div>
                    <div className="mb-2">
                      <span className="text-2xl font-bold text-gray-900">{macroNutrients.protein.consumed}</span>
                      <span className="text-gray-600 ml-1">g / {macroNutrients.protein.goal}g</span>
                    </div>
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 rounded-full bg-gray-200">
                        <div
                          style={{ width: `${(macroNutrients.protein.consumed / macroNutrients.protein.goal) * 100}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                        ></div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      {macroNutrients.protein.goal - macroNutrients.protein.consumed}g restantes
                    </div>
                  </div>

                  {/* Carbs */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <Circle className="w-5 h-5 text-green-600" />
                      <h3 className="font-medium text-gray-900">Carboidratos</h3>
                    </div>
                    <div className="mb-2">
                      <span className="text-2xl font-bold text-gray-900">{macroNutrients.carbs.consumed}</span>
                      <span className="text-gray-600 ml-1">g / {macroNutrients.carbs.goal}g</span>
                    </div>
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 rounded-full bg-gray-200">
                        <div
                          style={{ width: `${(macroNutrients.carbs.consumed / macroNutrients.carbs.goal) * 100}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600"
                        ></div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      {macroNutrients.carbs.goal - macroNutrients.carbs.consumed}g restantes
                    </div>
                  </div>

                  {/* Fats */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <ChevronDown className="w-5 h-5 text-purple-600 rotate-180" />
                      <h3 className="font-medium text-gray-900">Gorduras</h3>
                    </div>
                    <div className="mb-2">
                      <span className="text-2xl font-bold text-gray-900">{macroNutrients.fats.consumed}</span>
                      <span className="text-gray-600 ml-1">g / {macroNutrients.fats.goal}g</span>
                    </div>
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 rounded-full bg-gray-200">
                        <div
                          style={{ width: `${(macroNutrients.fats.consumed / macroNutrients.fats.goal) * 100}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-600"
                        ></div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      {macroNutrients.fats.goal - macroNutrients.fats.consumed}g restantes
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Recent Insights */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-gray-900">
                    💡 Insights Recentes
                  </h2>
                  <Info className="w-5 h-5 text-gray-500" />
                </div>
                <p className="text-gray-600 text-sm mb-4">Recomendações baseadas em seus dados</p>

                <div className="space-y-3">
                  {recentInsights.map((insight, index) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl border ${insight.type === 'positive'
                        ? 'bg-green-50 border-green-200'
                        : insight.type === 'tip'
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-yellow-50 border-yellow-200'
                        }`}
                    >
                      <div className="flex items-start space-x-3">
                        {insight.type === 'positive' && (
                          <HeartPulse className="w-5 h-5 text-green-600 mt-0.5" />
                        )}
                        {insight.type === 'tip' && (
                          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                        )}
                        {insight.type === 'warning' && (
                          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        )}
                        <div>
                          <h3 className="font-bold text-gray-900">{insight.title}</h3>
                          <p className="text-gray-600 text-sm">{insight.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
              >
                <h2 className="text-xl font-bold mb-3 text-gray-900">⚡ Ações Rápidas</h2>
                <div className="space-y-3">
                  <motion.button
                    onClick={() => setActiveTab('labs')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-cyan-200 hover:from-blue-100 hover:to-cyan-100 transition-all duration-300"
                  >
                    <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <Upload className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="font-bold block text-gray-900 text-sm">📂 Upload de Exames</span>
                      <span className="text-gray-600 text-xs">IA analisará seus resultados</span>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={takePhoto}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-emerald-200 hover:from-green-100 hover:to-emerald-100 transition-all duration-300"
                  >
                    <div className="w-9 h-9 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="font-bold block text-gray-900 text-sm">📸 Foto da Refeição</span>
                      <span className="text-gray-600 text-xs">Estimativa automática de calorias</span>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:from-purple-100 hover:to-pink-100 transition-all duration-300"
                  >
                    <div className="w-9 h-9 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="font-bold block text-gray-900 text-sm">🤖 Chat com IA</span>
                      <span className="text-gray-600 text-xs">Assistente de saúde 24/7</span>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => setActiveTab('nutrition-plan')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 hover:from-yellow-100 hover:to-orange-100 transition-all duration-300"
                  >
                    <div className="w-9 h-9 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="font-bold block text-gray-900 text-sm">📋 Upload Plano Alimentar</span>
                      <span className="text-gray-600 text-xs">Importe seu plano receitado</span>
                    </div>
                  </motion.button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gradient-to-br from-cyan-50 to-purple-50 rounded-2xl border border-cyan-200 p-5 shadow-sm"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="w-5 h-5 text-cyan-700" />
                  <h3 className="text-lg font-bold text-gray-900">🔒 Privacidade Garantida</h3>
                </div>
                <p className="text-gray-700 text-xs">
                  Seus dados são criptografados com tecnologia de ponta 🔐
                </p>
                <div className="flex items-center space-x-1 mt-3 text-[10px] text-gray-600">
                  <Lock className="w-3 h-3" />
                  <span>Privacy by Design • GDPR Compliant</span>
                </div>
                <div className="mt-2 flex space-x-1">
                  <span className="bg-gray-200 px-1.5 py-0.5 rounded text-[10px] text-gray-700">AES-256</span>
                  <span className="bg-gray-200 px-1.5 py-0.5 rounded text-[10px] text-gray-700">TLS 1.3</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Nutrition Plan Module */}
        {activeTab === 'nutrition-plan' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto w-full"
          >
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  📋 Análise de Plano Alimentar
                </h2>
                <p className="text-gray-600 text-sm">
                  Faça upload do seu plano alimentar e receba uma análise personalizada por IA 🧠
                </p>
              </div>

              {/* Upload Section */}
              {!planUploaded ? (
                uploadedFile ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center"
                  >
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Target className="w-8 h-8 text-amber-600 animate-pulse" />
                      <div>
                        <h3 className="font-bold text-amber-800 text-lg">Analisando seu Plano...</h3>
                        <p className="text-amber-700">
                          Nossa IA está extraindo as melhores receitas e macros para você ⚡
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <label className="block border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-cyan-400 transition-all duration-300">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={uploadNutritionPlan}
                      className="hidden"
                    />
                    <Upload className="w-14 h-14 text-gray-400 mx-auto mb-3" />
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-400 hover:to-cyan-500 transition-all duration-300 inline-flex items-center space-x-1.5">
                      <span className="text-sm">📄 Selecionar Arquivo do Plano</span>
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <p className="text-gray-500 text-xs mt-3">Suportamos arquivos PDF e DOCX • Análise por IA</p>
                  </label>
                )
              ) : (
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <h3 className="font-bold text-green-900">Plano Processado com Sucesso!</h3>
                        <p className="text-green-700 text-sm">Identificamos {recipeSuggestions.length} sugestões de refeições.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setPlanUploaded(false);
                        setUploadedFile(null);
                        setRecipeSuggestions([]);
                      }}
                      className="text-green-700 hover:text-green-900 text-sm font-medium underline"
                    >
                      Enviar novo plano
                    </button>
                  </motion.div>

                  <h3 className="font-bold text-xl text-gray-900">📊 Resumo do Plano</h3>
                  {/* Macros Summary Card */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-lg font-bold text-gray-900">Nutrientes Diários Sugeridos</h2>
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {/* Calories */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center space-x-2 mb-3">
                          <Flame className="w-5 h-5 text-orange-600" />
                          <h3 className="font-medium text-gray-900 text-sm">Calorias</h3>
                        </div>
                        <div className="mb-2">
                          <span className="text-xl font-bold text-gray-900">
                            {recipeSuggestions.reduce((acc, curr) => acc + curr.calories, 0)}
                          </span>
                          <span className="text-gray-600 ml-1 text-xs">kcal</span>
                        </div>
                        <div className="relative pt-1">
                          <div className="overflow-hidden h-1.5 rounded-full bg-gray-200">
                            <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-600 w-3/4"></div>
                          </div>
                        </div>
                      </div>

                      {/* Protein */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center space-x-2 mb-3">
                          <Droplet className="w-5 h-5 text-blue-600" />
                          <h3 className="font-medium text-gray-900 text-sm">Proteína</h3>
                        </div>
                        <div className="mb-2">
                          <span className="text-xl font-bold text-gray-900">
                            {recipeSuggestions.reduce((acc, curr) => acc + (curr.protein || 0), 0)}
                          </span>
                          <span className="text-gray-600 ml-1 text-xs">g</span>
                        </div>
                        <div className="relative pt-1">
                          <div className="overflow-hidden h-1.5 rounded-full bg-gray-200">
                            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 w-2/3"></div>
                          </div>
                        </div>
                      </div>

                      {/* Carbs */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center space-x-2 mb-3">
                          <Circle className="w-5 h-5 text-green-600" />
                          <h3 className="font-medium text-gray-900 text-sm">Carboidratos</h3>
                        </div>
                        <div className="mb-2">
                          <span className="text-xl font-bold text-gray-900">
                            {recipeSuggestions.reduce((acc, curr) => acc + (curr.carbs || 0), 0)}
                          </span>
                          <span className="text-gray-600 ml-1 text-xs">g</span>
                        </div>
                        <div className="relative pt-1">
                          <div className="overflow-hidden h-1.5 rounded-full bg-gray-200">
                            <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600 w-1/2"></div>
                          </div>
                        </div>
                      </div>

                      {/* Fats */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center space-x-2 mb-3">
                          <ChevronDown className="w-5 h-5 text-purple-600 rotate-180" />
                          <h3 className="font-medium text-gray-900 text-sm">Gorduras</h3>
                        </div>
                        <div className="mb-2">
                          <span className="text-xl font-bold text-gray-900">
                            {recipeSuggestions.reduce((acc, curr) => acc + (curr.fats || 0), 0)}
                          </span>
                          <span className="text-gray-600 ml-1 text-xs">g</span>
                        </div>
                        <div className="relative pt-1">
                          <div className="overflow-hidden h-1.5 rounded-full bg-gray-200">
                            <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-600 w-1/4"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <h3 className="font-bold text-xl text-gray-900">🍽️ Sugestões do Dia</h3>

                  <div className="space-y-4">
                    {recipeSuggestions.map((recipe, index) => (
                      <motion.div
                        key={recipe.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden"
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="inline-block px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-cyan-600 mb-1">
                                {recipe.time}
                              </span>
                              <h4 className="font-bold text-lg text-gray-900">{recipe.name}</h4>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center text-orange-500 font-bold mb-1 justify-end">
                                <Flame className="w-4 h-4 mr-1" />
                                {recipe.calories} kcal
                              </div>
                              <button
                                onClick={() => regenerateSingleMeal(recipe.id, recipe.type)}
                                className="flex items-center space-x-1 text-xs text-cyan-600 font-medium hover:text-cyan-800 transition-colors ml-auto bg-cyan-50 px-2 py-1 rounded-md"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Gerar Nova</span>
                              </button>
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-3 border border-gray-100">
                            <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Ingredientes:</h5>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {recipe.ingredients.map((msg, i) => (
                                <li key={i} className="flex items-center text-sm text-gray-700">
                                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-2"></div>
                                  {msg}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Labs Module */}
        {activeTab === 'labs' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto w-full"
          >
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  🔬 Análise de Exames de Sangue
                </h2>
                <p className="text-gray-600 text-sm">
                  Faça upload do seu exame e receba uma análise personalizada por IA 🧠
                </p>
              </div>

              {!uploadedFile ? (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-cyan-400 transition-all duration-300 cursor-pointer"
                >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer"
                  >
                    <Upload className="w-14 h-14 text-gray-400 mx-auto mb-3" />
                    <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 inline-flex items-center space-x-1.5">
                      <span className="text-sm">📄 Selecionar Arquivo PDF</span>
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <p className="text-gray-500 text-xs mt-3">Suportamos apenas arquivos PDF • Análise por IA</p>
                  </label>
                </motion.div>
              ) : (
                <div className="space-y-5">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-amber-50 border border-amber-200 rounded-xl p-3"
                  >
                    <div className="flex items-start space-x-2">
                      <Target className="w-4 h-4 text-amber-600 mt-0.5" />
                      <div>
                        <h3 className="font-bold text-amber-800 text-sm">🤖 Análise por IA em Progresso</h3>
                        <p className="text-amber-700 text-xs">
                          Estamos processando seu exame com algoritmos de ponta... ⚡
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {analysisResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2 }}
                      className="space-y-3"
                    >
                      <h3 className="font-bold text-xl text-cyan-700 mb-4">📊 Resultados da Análise</h3>
                      {Object.entries(analysisResult).map(([key, value]) => (
                        <motion.div
                          key={key}
                          whileHover={{ scale: 1.01 }}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
                        >
                          <div>
                            <h4 className="font-bold capitalize text-base text-gray-900">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                            <p className="text-gray-600 text-sm">Valor: {value.value} | Normal: {value.normal}</p>
                          </div>
                          <div className={`px-3 py-1 rounded-lg text-xs font-bold ${value.status === 'low' || value.status === 'high'
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-green-100 text-green-700 border border-green-200'
                            }`}>
                            {value.status === 'low' ? '⚠️ Baixo' : value.status === 'high' ? '⚠️ Alto' : '✅ Normal'}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-red-800 flex items-center text-sm">
                      ⚠️ Aviso Importante
                      <Star className="w-3 h-3 ml-1 text-yellow-600" />
                    </h3>
                    <p className="text-red-700 text-xs">
                      A análise da IA é uma ferramenta de apoio educacional e não substitui o aconselhamento
                      de um profissional de saúde qualificado. Consulte sempre seu médico para interpretação
                      clínica dos seus resultados. 🩺
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Measurements Module */}
        {activeTab === 'measurements' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto w-full"
          >
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Ruler className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  📏 Análise de Medidas Corporais
                </h2>
                <p className="text-gray-600 text-sm">
                  Faça upload das suas medidas corporais e receba uma análise personalizada por IA 🧠
                </p>
              </div>

              {/* Upload Section */}
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                <Upload className="w-14 h-14 text-gray-400 mx-auto mb-3" />
                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-400 hover:to-cyan-500 transition-all duration-300 inline-flex items-center space-x-1.5">
                  <span className="text-sm">📄 Selecionar Arquivo PDF</span>
                  <Sparkles className="w-3 h-3" />
                </div>
                <p className="text-gray-500 text-xs mt-3">Suportamos apenas arquivos PDF • Análise por IA</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Food Module */}
        {activeTab === 'food' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto w-full"
          >
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Camera className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  🥗 Registro de Alimentação Inteligente
                </h2>
                <p className="text-gray-600 text-sm">
                  Registre suas refeições em segundos com IA de última geração 🤖
                </p>
              </div>

              {/* Meal Type Selector */}
              {!showMealTypeSelector ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <motion.button
                    onClick={() => {
                      setSelectedMealType('Café da manhã');
                      setShowMealTypeSelector(true);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-cyan-200 hover:from-blue-100 hover:to-cyan-100 transition-all duration-300"
                  >
                    <Coffee className="w-8 h-8 text-blue-600" />
                    <div className="text-left">
                      <span className="font-bold block text-gray-900">☕ Café da manhã</span>
                      <span className="text-gray-600 text-xs">Registrar sua primeira refeição</span>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      setSelectedMealType('Almoço');
                      setShowMealTypeSelector(true);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-emerald-200 hover:from-green-100 hover:to-emerald-100 transition-all duration-300"
                  >
                    <Utensils className="w-8 h-8 text-green-600" />
                    <div className="text-left">
                      <span className="font-bold block text-gray-900">🍱 Almoço</span>
                      <span className="text-gray-600 text-xs">Registrar sua refeição principal</span>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      setSelectedMealType('Jantar');
                      setShowMealTypeSelector(true);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:from-purple-100 hover:to-pink-100 transition-all duration-300"
                  >
                    <Moon className="w-8 h-8 text-purple-600" />
                    <div className="text-left">
                      <span className="font-bold block text-gray-900">🌙 Jantar</span>
                      <span className="text-gray-600 text-xs">Registrar sua última refeição</span>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      setSelectedMealType('Lanche');
                      setShowMealTypeSelector(true);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 hover:from-yellow-100 hover:to-orange-100 transition-all duration-300"
                  >
                    <Apple className="w-8 h-8 text-yellow-600" />
                    <div className="text-left">
                      <span className="font-bold block text-gray-900">🍎 Lanche</span>
                      <span className="text-gray-600 text-xs">Registrar seu lanche</span>
                    </div>
                  </motion.button>
                </div>
              ) : (
                /* Registration Methods */
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <button
                      onClick={() => setShowMealTypeSelector(false)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h3 className="text-xl font-bold text-gray-900">Registrar {selectedMealType}</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                    <motion.button
                      onClick={takePhoto}
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex flex-col items-center justify-center p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200 hover:from-cyan-100 hover:to-blue-100 transition-all duration-300"
                    >
                      <Camera className="w-8 h-8 text-cyan-600 mb-2" />
                      <span className="font-bold text-cyan-700 text-sm">📸 Foto</span>
                      <span className="text-gray-600 text-xs mt-1">IA analisa seu prato</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex flex-col items-center justify-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:from-green-100 hover:to-emerald-100 transition-all duration-300"
                      onClick={() => {
                        // Simulate voice input
                        addMealByVoice("Comi frango com arroz");
                      }}
                    >
                      <Mic className="w-8 h-8 text-green-600 mb-2" />
                      <span className="font-bold text-green-700 text-sm">🎤 Voz</span>
                      <span className="text-gray-600 text-xs mt-1">"Comi frango com arroz"</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex flex-col items-center justify-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:from-purple-100 hover:to-pink-100 transition-all duration-300"
                      onClick={() => {
                        // Simulate barcode scan
                        addMealByBarcode("1234567890");
                      }}
                    >
                      <ScanBarcode className="w-8 h-8 text-purple-600 mb-2" />
                      <span className="font-bold text-purple-700 text-sm">🔍 Código</span>
                      <span className="text-gray-600 text-xs mt-1">Scanner de produtos</span>
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Today's Log */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-xl text-emerald-700">🍽️ Registro de Hoje</h3>
                  <div className="flex items-center space-x-1">
                    <span className="font-bold text-gray-900">Total: {totalTodayCalories} cal</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {mealLog.map((meal, index) => (
                    <motion.div
                      key={meal.id}
                      whileHover={{ x: 5 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{meal.emoji}</span>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">{meal.type}</h4>
                          <p className="text-gray-600 text-xs">{meal.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="font-bold text-gray-900 text-sm">{meal.calories} cal</span>
                        {meal.calories > 0 && <CheckCircle className="w-3 h-3 text-green-600" />}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Progress Module */}
        {activeTab === 'progress' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto w-full"
          >
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <ChartLine className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  📈 Rastreamento de Progresso
                </h2>
                <p className="text-gray-600 text-sm">
                  Acompanhe sua jornada de saúde ao longo do tempo
                </p>
              </div>

              {/* Submenu Tabs */}
              <div className="flex flex-col gap-4 mb-6">
                <motion.button
                  onClick={() => setShowProgressSubmenu('exams')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl font-medium transition-all duration-300 ${showProgressSubmenu === 'exams'
                    ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  Histórico de Exames
                </motion.button>

                <motion.button
                  onClick={() => setShowProgressSubmenu('biomarkers')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl font-medium transition-all duration-300 ${showProgressSubmenu === 'biomarkers'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  Tendências de Biomarcadores
                </motion.button>
              </div>

              {/* Exam History */}
              {showProgressSubmenu === 'exams' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <Database className="w-5 h-5 text-gray-600" />
                      <h3 className="font-medium text-gray-900">Histórico de Exames de Sangue</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">Todos os seus exames importados e analisados</p>

                    <div className="space-y-4">
                      {examHistory.map((exam, index) => (
                        <div key={exam.id} className="p-4 bg-white rounded-xl border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-bold text-gray-900">Exame de Sangue</h4>
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-600 text-sm">📅 {exam.date}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${exam.status === 'Atenção'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : exam.status === 'Ótimo'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                  }`}>
                                  {exam.status}
                                </span>
                              </div>
                            </div>
                            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium">
                              Ver Detalhes
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div>
                                  <div className="text-gray-600 text-xs">Ótimo</div>
                                  <div className="font-bold text-gray-900">{exam.optimal}</div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-1">
                                <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c1.268-1.268 3.173-1.268 4.441 0l2.077 2.077a1 1 0 011.414 1.414l-2.077 2.077a1 1 0 01-1.414 0l-2.077-2.077a1 1 0 010-1.414l2.077-2.077zM2.5 12.75a6 6 0 0112 0h-12z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div>
                                  <div className="text-gray-600 text-xs">Atenção</div>
                                  <div className="font-bold text-gray-900">{exam.attention}</div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-1">
                                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 11-2 0v6a1 1 0 112 0V6zm-2 8a1 1 0 112 0v2a1 1 0 11-2 0v-2z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div>
                                  <div className="text-gray-600 text-xs">Melhorar</div>
                                  <div className="font-bold text-gray-900">{exam.improve}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="text-gray-600 text-sm mb-2">Total de Exames</div>
                      <div className="text-2xl font-bold text-gray-900">3</div>
                      <div className="text-gray-500 text-xs mt-1">Último: 14/01/2024</div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="text-gray-600 text-sm mb-2">Biomarcadores Analisados</div>
                      <div className="text-2xl font-bold text-gray-900">4</div>
                      <div className="text-gray-500 text-xs mt-1">Por exame</div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="text-gray-600 text-sm mb-2">Melhora Geral</div>
                      <div className="text-2xl font-bold text-green-600">+12%</div>
                      <div className="text-gray-500 text-xs mt-1">Últimos 6 meses</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Biomarker Trends */}
              {showProgressSubmenu === 'biomarkers' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <List className="w-5 h-5 text-gray-600" />
                      <h3 className="font-medium text-gray-900">Selecione o Biomarcador</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">Visualize a evolução dos seus resultados ao longo do tempo</p>

                    <div className="flex flex-wrap gap-2">
                      {biomarkerTrends.map((biomarker) => (
                        <motion.button
                          key={biomarker.id}
                          onClick={() => {
                            // Set current biomarker for display
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${biomarker.name === "Colesterol Total"
                            ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                          {biomarker.name}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Biomarker Detail */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Colesterol Total</h3>
                        <p className="text-gray-600 text-sm">Ref: &lt; 200 mg/dL</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-600">Melhorando</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-gray-600 text-sm">Valor Atual</div>
                          <div className="text-2xl font-bold text-gray-900">210 mg/dL</div>
                        </div>
                        <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          Melhorando
                        </div>
                      </div>
                    </div>

                    <div className="mb-6 overflow-x-auto">
                      <div className="flex items-center space-x-4 min-w-max">
                        {biomarkerTrends[0].values.map((value, index) => (
                          <div key={index} className="flex flex-col items-center min-w-20">
                            <div className="w-full h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-sm">{value.value}</span>
                            </div>
                            <div className="text-gray-600 text-xs mt-2 whitespace-nowrap">{value.date}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-gray-600" />
                        <h4 className="font-medium text-gray-900">Interpretação:</h4>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Seu colesterol total tem diminuído gradualmente nos últimos meses, o que é positivo. Continue com a dieta e exercícios recomendados.
                      </p>
                    </div>
                  </div>

                  {/* Time Period Selection */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <Clock className="w-5 h-5 text-gray-600" />
                      <h3 className="font-medium text-gray-900">Período de Análise</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">Ajuste o período para visualizar diferentes intervalos de tempo</p>

                    <div className="flex flex-wrap gap-2">
                      {['7 Dias', '30 Dias', '90 Dias', '1 Ano'].map((period) => (
                        <motion.button
                          key={period}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${period === '30 Dias'
                            ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                          {period}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around items-center p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center p-2 rounded-lg w-full ${activeTab === tab.id ? 'text-cyan-600 bg-cyan-50' : 'text-gray-400'
                  }`}
              >
                <span className="text-xl mb-1">{tab.emoji}</span>
                <span className="text-[10px] font-medium">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Mobile Notifications Bottom Sheet */}
      <AnimatePresence>
        {showMobileNotifications && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileNotifications(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-[70] lg:hidden overflow-hidden h-[80vh] flex flex-col"
            >
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0" onClick={() => setShowMobileNotifications(false)}>
                <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
              </div>

              <div className="p-4 border-b border-gray-50 bg-gray-50 flex justify-between items-center flex-shrink-0">
                <h3 className="font-bold text-gray-900 text-lg">Notificações</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllNotificationsAsRead} className="text-xs text-cyan-600 hover:text-cyan-800 font-bold bg-cyan-50 px-3 py-1.5 rounded-full">
                    Marcar todas como lidas
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                    <Bell className="w-12 h-12 text-gray-200" />
                    <p>Tudo limpo por aqui!</p>
                  </div>
                ) : (
                  notifications.map(notification => (
                    <button
                      key={notification.id}
                      onClick={() => markNotificationAsRead(notification.id, notification.target)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start space-x-4 ${!notification.read
                        ? 'bg-cyan-50/50 border-cyan-100 shadow-sm'
                        : 'bg-white border-gray-100'
                        }`}
                    >
                      <div className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${!notification.read ? 'bg-cyan-500 ring-2 ring-cyan-200' : 'bg-gray-200'}`}></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className={`text-base ${!notification.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {notification.title}
                          </p>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{notification.time}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 leading-snug">{notification.description}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-gray-100 flex-shrink-0">
                <button onClick={() => setShowMobileNotifications(false)} className="w-full bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl">
                  Fechar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Profile Bottom Sheet */}
      <AnimatePresence>
        {showMobileProfile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileProfile(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-[70] lg:hidden overflow-hidden"
            >
              <div className="flex justify-center pt-3 pb-1" onClick={() => setShowMobileProfile(false)}>
                <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
              </div>

              <div className="p-6">
                <div className="flex items-center space-x-4 mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-white">
                    {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full" /> : user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="mt-1 inline-flex items-center bg-cyan-100 text-cyan-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                      Membro Pro
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button className="w-full bg-white border border-gray-200 p-4 rounded-xl flex items-center space-x-4 text-gray-700 font-bold active:scale-95 transition-all hover:bg-gray-50 hover:border-cyan-200 shadow-sm">
                    <div className="p-2 bg-cyan-50 rounded-lg text-cyan-600">
                      <User className="w-5 h-5" />
                    </div>
                    <span>Ver Perfil Completo</span>
                    <ChevronDown className="w-5 h-5 ml-auto -rotate-90 text-gray-300" />
                  </button>
                  <button className="w-full bg-white border border-gray-200 p-4 rounded-xl flex items-center space-x-4 text-gray-700 font-bold active:scale-95 transition-all hover:bg-gray-50 hover:border-cyan-200 shadow-sm">
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                      <Settings className="w-5 h-5" />
                    </div>
                    <span>Configurações</span>
                    <ChevronDown className="w-5 h-5 ml-auto -rotate-90 text-gray-300" />
                  </button>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-50 text-red-600 font-bold p-4 rounded-xl flex items-center justify-center space-x-2 active:scale-95 transition-transform hover:bg-red-100"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sair da Conta</span>
                  </button>
                  <p className="text-center text-gray-400 text-xs mt-4">Versão 1.0.2</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Chatbot */}
      <div className="fixed bottom-24 right-4 z-50 lg:bottom-4 lg:right-4">
        {!showChatbot ? (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowChatbot(true)}
            className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white"
          >
            <Bot className="w-6 h-6" />
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 h-96 flex flex-col"
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-cyan-500 to-purple-600 rounded-t-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold">Assistente Nutrixo</h3>
                </div>
                <button
                  onClick={() => setShowChatbot(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-cyan-100 text-xs mt-1">Sempre disponível para ajudar</p>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: message.type === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-2xl ${message.type === 'user'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                      }`}
                  >
                    {message.message}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Digite sua pergunta..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  type="submit"
                  className="w-10 h-10 bg-cyan-500 text-white rounded-full flex items-center justify-center hover:bg-cyan-600 transition-colors"
                >
                  <SendIcon />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

export default App;
