"use client";

import Link from "next/link";
import { FolderOpen, Sparkles, History, TestTube2, ArrowRight, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/hooks/use-projects";
import { useGenerations } from "@/hooks/use-generations";
import { useAuthStore } from "@/store/auth-store";
import { formatDate } from "@/lib/utils";

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: generations = [], isLoading: gensLoading } = useGenerations();

  const totalTestCases = generations.reduce((sum, g) => sum + g.test_case_count, 0);
  const recentGenerations = generations.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}!
        </h2>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s an overview of your test generation activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {projectsLoading || gensLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))
        ) : (
          <>
            <StatCard title="Total projects" value={projects.length} icon={FolderOpen} color="bg-blue-500" />
            <StatCard title="Generations" value={generations.length} icon={Sparkles} color="bg-violet-500" />
            <StatCard title="Test cases created" value={totalTestCases} icon={TestTube2} color="bg-green-500" />
          </>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="border-dashed border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h3 className="font-semibold text-gray-900">Generate test cases</h3>
              <p className="text-sm text-muted-foreground">Use AI to generate tests from a requirement</p>
            </div>
            <Link href="/generate">
              <Button size="sm" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Generate
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-violet-300 bg-violet-50 hover:bg-violet-100 transition-colors">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h3 className="font-semibold text-gray-900">Create a project</h3>
              <p className="text-sm text-muted-foreground">Organize your test cases by project</p>
            </div>
            <Link href="/projects">
              <Button size="sm" variant="secondary" className="gap-2">
                <Plus className="h-4 w-4" />
                New project
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent generations */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Recent generations</h3>
          <Link href="/history">
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {gensLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : recentGenerations.length === 0 ? (
          <Card className="p-8 text-center">
            <Sparkles className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium text-gray-900">No generations yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Generate your first test cases to see them here.
            </p>
            <Link href="/generate" className="mt-4 inline-block">
              <Button size="sm">Get started</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentGenerations.map((gen) => (
              <Card key={gen.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">{gen.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(gen.created_at)}</p>
                  </div>
                  <div className="ml-4 flex shrink-0 items-center gap-2">
                    <Badge variant="outline" className="text-xs">{gen.test_type}</Badge>
                    <span className="text-sm text-muted-foreground">{gen.test_case_count} cases</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
