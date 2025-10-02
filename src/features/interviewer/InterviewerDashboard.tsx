
'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  ArrowUpDown,
  FileText,
  User,
  Star,
  TrendingUp,
} from 'lucide-react';
import type { RootState } from '@/lib/store/store';
import type { Candidate } from '@/lib/store/features/candidates/candidatesSlice';
import { CandidateDetail } from './CandidateDetail';

export function InterviewerDashboard() {
  const allCandidates = useSelector(
    (state: RootState) => state.candidates.candidates
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Candidate['interview']['summary'];
    direction: 'asc' | 'desc';
  } | null>({ key: 'totalScore', direction: 'desc' });
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );

  const handleSort = (key: keyof Candidate['interview']['summary']) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'desc'
    ) {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredCandidates = [...allCandidates]
    .filter((c) =>
      c.profile.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortConfig) return 0;
      const aValue = a.interview.summary[sortConfig.key] as number;
      const bValue = b.interview.summary[sortConfig.key] as number;

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  const topPerformer = [...allCandidates].sort(
    (a, b) => b.interview.summary.totalScore - a.interview.summary.totalScore
  )[0];

  const averageScore =
    allCandidates.length > 0
      ? (
          allCandidates.reduce(
            (acc, c) => acc + c.interview.summary.totalScore,
            0
          ) / allCandidates.length
        ).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Interviewer Dashboard
          </h1>
          <p className="text-muted-foreground">
            Review candidate performance and interview history.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Candidates
            </CardTitle>
            <User className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allCandidates.length}</div>
            <p className="text-xs text-muted-foreground">
              {allCandidates.length} interviews completed.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Score
            </CardTitle>
            <Star className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}</div>
            <p className="text-xs text-muted-foreground">
              Across all candidates.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            <TrendingUp className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topPerformer ? topPerformer.interview.summary.totalScore : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {topPerformer ? topPerformer.profile.name : 'No candidates yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Candidates</CardTitle>
          <CardDescription>
            Search, sort, and view detailed reports for each candidate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Dialog
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setSelectedCandidate(null);
              }
            }}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort('totalScore')}
                  >
                    <div className="flex items-center gap-1">
                      Score
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAndFilteredCandidates.map((candidate) => (
                  <TableRow key={candidate.profile.email}>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>
                            {candidate.profile.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {candidate.profile.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {candidate.profile.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">
                        {candidate.interview.summary.totalScore}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {candidate.interview.summary.text}
                    </TableCell>
                    <TableCell className="text-right">
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCandidate(candidate)}
                        >
                          <FileText className="mr-2" />
                          View Report
                        </Button>
                      </DialogTrigger>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {selectedCandidate && (
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>
                    Interview Report for {selectedCandidate.profile.name}
                  </DialogTitle>
                </DialogHeader>
                <CandidateDetail candidate={selectedCandidate} />
              </DialogContent>
            )}
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
