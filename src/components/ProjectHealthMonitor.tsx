
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Code2, 
  TestTube, 
  Shield, 
  Zap,
  Database,
  GitBranch,
  Users,
  Bug,
  Target,
  Gauge
} from "lucide-react";

interface HealthMetric {
  name: string;
  value: number;
  threshold: number;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface CodeQualityMetric {
  metric: string;
  current: number;
  target: number;
  trend: string;
  status: 'pass' | 'warning' | 'fail';
}

export function ProjectHealthMonitor() {
  const [healthScore, setHealthScore] = useState(85);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const healthMetrics: HealthMetric[] = [
    {
      name: 'Code Coverage',
      value: 87,
      threshold: 80,
      status: 'good',
      trend: 'up',
      description: 'Percentage of code covered by tests'
    },
    {
      name: 'Build Success Rate',
      value: 94,
      threshold: 95,
      status: 'warning',
      trend: 'down',
      description: 'Percentage of successful builds'
    },
    {
      name: 'API Response Time',
      value: 245,
      threshold: 200,
      status: 'warning',
      trend: 'up',
      description: 'Average API response time (ms)'
    },
    {
      name: 'Security Score',
      value: 92,
      threshold: 90,
      status: 'good',
      trend: 'stable',
      description: 'Security vulnerability score'
    },
    {
      name: 'Technical Debt',
      value: 15,
      threshold: 20,
      status: 'good',
      trend: 'down',
      description: 'Technical debt hours'
    },
    {
      name: 'Dependencies Health',
      value: 78,
      threshold: 80,
      status: 'warning',
      trend: 'down',
      description: 'Outdated/vulnerable dependencies'
    }
  ];

  const codeQualityMetrics: CodeQualityMetric[] = [
    { metric: 'Maintainability Index', current: 85, target: 80, trend: '+2%', status: 'pass' },
    { metric: 'Cyclomatic Complexity', current: 12, target: 15, trend: '-5%', status: 'pass' },
    { metric: 'Code Duplication', current: 8, target: 10, trend: '+1%', status: 'pass' },
    { metric: 'Lines of Code', current: 15420, target: 20000, trend: '+12%', status: 'pass' },
    { metric: 'Test Coverage', current: 87, target: 85, trend: '+3%', status: 'pass' },
    { metric: 'ESLint Issues', current: 23, target: 20, trend: '+15%', status: 'warning' }
  ];

  const performanceMetrics = [
    { name: 'Bundle Size', value: '284 KB', trend: '+5%', status: 'warning' },
    { name: 'First Paint', value: '1.2s', trend: '-8%', status: 'good' },
    { name: 'Time to Interactive', value: '2.8s', trend: '+12%', status: 'warning' },
    { name: 'Lighthouse Score', value: '92', trend: '+2%', status: 'good' }
  ];

  const securityMetrics = [
    { name: 'Vulnerabilities', value: '3 Low', status: 'warning' },
    { name: 'Dependencies Audit', value: 'Clean', status: 'good' },
    { name: 'HTTPS Grade', value: 'A+', status: 'good' },
    { name: 'Security Headers', value: '8/10', status: 'warning' }
  ];

  const teamMetrics = [
    { name: 'Active Contributors', value: 8, trend: '+2' },
    { name: 'Commits This Week', value: 47, trend: '+15%' },
    { name: 'Pull Requests Open', value: 12, trend: '-3' },
    { name: 'Code Reviews Pending', value: 5, trend: '+2' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
      case 'pass':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
      case 'fail':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-600" />;
      default:
        return <Clock className="w-3 h-3 text-gray-600" />;
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // Simulate slight variations in health score
      setHealthScore(prev => {
        const variation = (Math.random() - 0.5) * 4;
        return Math.max(60, Math.min(100, prev + variation));
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Project Health Monitor
          </CardTitle>
          <CardDescription>
            Real-time monitoring of project health, performance, and team metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getHealthScoreColor(healthScore)}`}>
                    {Math.round(healthScore)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Overall Health</div>
                  <Progress value={healthScore} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">24</div>
                  <div className="text-sm text-muted-foreground">Active Issues</div>
                  <Badge className="mt-2 bg-blue-100 text-blue-800">-3 from last week</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">98.5%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                  <Badge className="mt-2 bg-green-100 text-green-800">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +0.2%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">12min</div>
                  <div className="text-sm text-muted-foreground">Avg Deploy Time</div>
                  <Badge className="mt-2 bg-purple-100 text-purple-800">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    -2min
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">
                <Gauge className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="quality">
                <Code2 className="w-4 h-4 mr-2" />
                Quality
              </TabsTrigger>
              <TabsTrigger value="performance">
                <Zap className="w-4 h-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="team">
                <Users className="w-4 h-4 mr-2" />
                Team
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {healthMetrics.map((metric, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{metric.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(metric.trend)}
                          <Badge className={getStatusColor(metric.status)}>
                            {metric.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold">
                          {metric.name === 'API Response Time' ? `${metric.value}ms` : `${metric.value}%`}
                        </div>
                        <p className="text-xs text-muted-foreground">{metric.description}</p>
                        <Progress 
                          value={metric.name === 'API Response Time' ? 
                            Math.max(0, 100 - (metric.value / metric.threshold * 100)) : 
                            metric.value
                          } 
                          className="h-2" 
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="quality" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {codeQualityMetrics.map((metric, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">{metric.metric}</h4>
                        <Badge className={getStatusColor(metric.status)}>
                          {metric.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold">{metric.current}</div>
                          <div className="text-xs text-muted-foreground">Target: {metric.target}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            metric.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {metric.trend}
                          </div>
                          <div className="text-xs text-muted-foreground">vs last week</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {performanceMetrics.map((metric, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">{metric.name}</h4>
                        <Badge className={getStatusColor(metric.status)}>
                          {metric.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">{metric.value}</div>
                        <div className={`text-sm font-medium ${
                          metric.trend.startsWith('+') ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {metric.trend}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {securityMetrics.map((metric, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">{metric.name}</h4>
                        <Badge className={getStatusColor(metric.status)}>
                          {metric.status}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold">{metric.value}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="team" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamMetrics.map((metric, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">{metric.name}</h4>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">{metric.value}</div>
                        <div className={`text-sm font-medium ${
                          metric.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metric.trend}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-4 text-xs text-muted-foreground text-center">
            Last updated: {lastUpdate.toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
