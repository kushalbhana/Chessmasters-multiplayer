"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Brain, Target, Clock, ChevronRight, Award, BarChart3 } from "lucide-react";

const AnalyticsSection = () => {
  const performanceData = [
    { month: "Jan", accuracy: 85, rating: 1650 },
    { month: "Feb", accuracy: 78, rating: 1620 },
    { month: "Mar", accuracy: 92, rating: 1720 },
    { month: "Apr", accuracy: 88, rating: 1680 },
    { month: "May", accuracy: 95, rating: 1780 },
    { month: "Jun", accuracy: 91, rating: 1750 }
  ];

  const moveAccuracyData = [
    { name: "Brilliant", value: 8, color: "#b5b3b3" },
    { name: "Great", value: 22, color: "#000" },
    { name: "Good", value: 45, color: "#fff" },
    { name: "Inaccuracy", value: 18, color: "#787878" },
    { name: "Mistake", value: 5, color: "#454444" },
    { name: "Blunder", value: 2, color: "#2e2d2d" }
  ];

  const chartConfig = {
    accuracy: {
      label: "Accuracy %",
      color: "#EF4444"
    },
    rating: {
      label: "Rating",
      color: "#3B82F6"
    }
  };

  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            MASTER YOUR
            <br />
            <span className="text-6xl md:text-7xl text-white">CHESS GAME</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Unlock your full potential with advanced game analysis. Review your matches, 
            discover brilliant moves you missed, and track your improvement over time.
          </p>
        </div>

        <div className=" gap-12 items-center mb-16">
          <div className=" flex justify-center items-center gap-8">
            <div className="flex items-center">
              <div className="bg-white rounded-full p-3 mr-3">
                <Brain className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">AI-Powered Analysis</h3>
                <p className="text-gray-400">Deep engine evaluation of every move</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-full p-3">
                <Target className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Move Accuracy</h3>
                <p className="text-gray-400">Track brilliant moves, mistakes, and blunders</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-full p-3">
                <TrendingUp className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Performance Trends</h3>
                <p className="text-gray-400">Monitor your progress and rating changes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Performance Trends</h3>
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <ChartContainer config={chartConfig} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <XAxis dataKey="month" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#000" 
                      strokeWidth={2}
                      dot={{ fill: "#000", r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rating" 
                      stroke="#fff" 
                      strokeWidth={2}
                      dot={{ fill: "#fff", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Move Quality Distribution</h3>
                <Target className="w-5 h-5 text-green-500" />
              </div>
              <ChartContainer config={chartConfig} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={moveAccuracyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {moveAccuracyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                {moveAccuracyData.map((item) => (
                  <div key={item.name} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-gray-300">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="bg-black rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Rating Improvement</h3>
              <p className="text-3xl font-bold text-white mb-2">+150</p>
              <p className="text-gray-400 text-sm">Last 3 months</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="bg-black rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Average Accuracy</h3>
              <p className="text-3xl font-bold text-white mb-2">91%</p>
              <p className="text-gray-400 text-sm">All analyzed games</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="bg-black rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Games Analyzed</h3>
              <p className="text-3xl font-bold text-white mb-2">247</p>
              <p className="text-gray-400 text-sm">Total analyzed</p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 text-lg font-semibold transition-all duration-300 group">
            VIEW DETAILED ANALYTICS
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsSection;