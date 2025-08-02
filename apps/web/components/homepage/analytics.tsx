"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { XAxis, YAxis, LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Brain, Target, Clock, ChevronRight, BarChart3 } from "lucide-react";

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
    accuracy: { label: "Accuracy %", color: "#EF4444" },
    rating: { label: "Rating", color: "#3B82F6" }
  };

  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            MASTER YOUR
            <br />
            <span className="text-4xl sm:text-6xl md:text-7xl text-white">CHESS GAME</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Unlock your full potential with advanced game analysis. Review your matches, 
            discover brilliant moves you missed, and track your improvement over time.
          </p>
        </div>

        {/* Features */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-8 mb-16">
        {[
          { Icon: Brain, title: "AI-Powered Analysis", desc: "Deep engine evaluation of every move" },
          { Icon: Target, title: "Move Accuracy", desc: "Track brilliant moves, mistakes, and blunders" },
          { Icon: TrendingUp, title: "Performance Trends", desc: "Monitor your progress and rating changes" },
        ].map((feature, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center text-center w-full sm:w-1/3 px-4"
          >
            <div className="bg-white rounded-full p-3 mb-3">
              <feature.Icon className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">{feature.title}</h3>
              <p className="text-gray-400 text-sm sm:text-base">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>


        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Line Chart */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-white">Performance Trends</h3>
                <BarChart3 className="w-5 h-5 text-white" />
              </div>

              {/* ✅ ChartContainer handles height and overflow */}
              <ChartContainer config={chartConfig} className="h-64 w-full overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={performanceData}
                    margin={{ top: 20, right: 20, left: 10, bottom: 10 }} // add inner padding
                  >
                    <XAxis dataKey="month" stroke="#6B7280" />
                    <YAxis
                      stroke="#6B7280"
                      domain={['dataMin - 10', 'dataMax + 10']}
                      allowDataOverflow={false}
                    />
                    {/* ✅ ChartTooltip stays inside ChartContainer */}
                    <ChartTooltip content={<ChartTooltipContent />} />
                    
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#000"
                      strokeWidth={2}
                      dot={{ fill: "#000", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rating"
                      stroke="#fff"
                      strokeWidth={2}
                      dot={{ fill: "#fff", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>


          {/* Pie Chart */}
          <Card className="bg-gray-800 border-gray-700">
  <CardContent className="p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg sm:text-xl font-bold text-white">Move Quality Distribution</h3>
      <Target className="w-5 h-5 text-green-500" />
    </div>

    {/* ✅ Ensure ChartContainer has fixed height & overflow hidden */}
    <ChartContainer config={chartConfig} className="h-64 w-full overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={moveAccuracyData}
            cx="50%"
            cy="50%"
            innerRadius="35%"      // ✅ Use % for responsive scaling
            outerRadius="70%"      // ✅ Scales with container
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

    <div className="grid grid-cols-2 gap-2 mt-4 text-xs sm:text-sm">
      {moveAccuracyData.map((item) => (
        <div key={item.name} className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
          <span className="text-gray-300">{item.name}</span>
        </div>
      ))}
    </div>
  </CardContent>
</Card>

        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          {[
            { Icon: TrendingUp, title: "Rating Improvement", value: "+150", subtitle: "Last 3 months" },
            { Icon: Target, title: "Average Accuracy", value: "91%", subtitle: "All analyzed games" },
            { Icon: Clock, title: "Games Analyzed", value: "247", subtitle: "Total analyzed" },
          ].map((stat, idx) => (
            <Card key={idx} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="bg-black rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  <stat.Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2">{stat.title}</h3>
                <p className="text-2xl sm:text-3xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-gray-400 text-xs sm:text-sm">{stat.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button className="bg-gray-700 hover:bg-gray-600 text-white px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold transition-all duration-300 group">
            VIEW DETAILED ANALYTICS
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsSection;
