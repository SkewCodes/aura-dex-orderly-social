import { useState, useMemo } from "react";
import { Link } from "@remix-run/react";
import {
  Trophy,
  Users,
  TrendingUp,
  BarChart3,
  Crown,
  Medal,
  Star,
  Zap,
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
  DollarSign,
  Flame,
  Award,
  Target,
  Share2,
  Youtube,
  Twitter,
  MessageCircle,
  ExternalLink,
  Copy,
  Check,
  ArrowUp,
  ArrowDown,
  Minus,
  Shield,
  Sparkles,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface TradingLeaderboardEntry {
  rank: number;
  previousRank?: number;
  address: string;
  displayName: string;
  avatar?: string;
  pnl: number;
  pnlPercent: number;
  volume: number;
  trades: number;
  winRate: number;
  isYou?: boolean;
}

interface QuestLeaderboardEntry {
  rank: number;
  previousRank?: number;
  address: string;
  displayName: string;
  avatar?: string;
  points: number;
  questsCompleted: number;
  streak: number;
  level: number;
  badges: string[];
  isKOL?: boolean;
  isYou?: boolean;
}

interface Competition {
  id: string;
  name: string;
  type: 'pnl' | 'volume';
  status: 'active' | 'ended';
  prizePool: number;
  participants: number;
  endsIn?: string;
  startDate: string;
  endDate: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const competitions: Competition[] = [
  {
    id: 'comp-1',
    name: 'February Trading Championship',
    type: 'pnl',
    status: 'active',
    prizePool: 50000,
    participants: 1247,
    endsIn: '27d 14h',
    startDate: 'Feb 1',
    endDate: 'Feb 28',
  },
  {
    id: 'comp-2',
    name: 'Weekly Sprint #8',
    type: 'pnl',
    status: 'active',
    prizePool: 10000,
    participants: 389,
    endsIn: '3d 8h',
    startDate: 'Jan 27',
    endDate: 'Feb 3',
  },
  {
    id: 'comp-3',
    name: 'ARB Launch Volume Race',
    type: 'volume',
    status: 'active',
    prizePool: 10000,
    participants: 523,
    endsIn: '5d 12h',
    startDate: 'Jan 28',
    endDate: 'Feb 4',
  },
];

const tradingLeaderboard: TradingLeaderboardEntry[] = [
  { rank: 1, previousRank: 1, address: '0x1234...5678', displayName: 'WhaleHunter', pnl: 284500, pnlPercent: 284.5, volume: 2450000, trades: 342, winRate: 72 },
  { rank: 2, previousRank: 3, address: '0x2345...6789', displayName: 'DeFiKing', pnl: 198200, pnlPercent: 198.2, volume: 1890000, trades: 287, winRate: 68 },
  { rank: 3, previousRank: 2, address: '0x3456...7890', displayName: 'TradeMaster', pnl: 154700, pnlPercent: 154.7, volume: 1650000, trades: 412, winRate: 65 },
  { rank: 4, previousRank: 5, address: '0x4567...8901', displayName: 'CryptoNinja', pnl: 132100, pnlPercent: 132.1, volume: 1420000, trades: 198, winRate: 71 },
  { rank: 5, previousRank: 4, address: '0x5678...9012', displayName: 'MoonShot', pnl: 98400, pnlPercent: 98.4, volume: 980000, trades: 156, winRate: 63 },
  { rank: 6, previousRank: 8, address: '0x6789...0123', displayName: 'AlphaSeeker', pnl: 87300, pnlPercent: 87.3, volume: 870000, trades: 234, winRate: 59 },
  { rank: 7, previousRank: 6, address: '0x7890...1234', displayName: 'BullRunner', pnl: 76500, pnlPercent: 76.5, volume: 765000, trades: 189, winRate: 62 },
  { rank: 8, previousRank: 7, address: '0x8901...2345', displayName: 'SwingKing', pnl: 65200, pnlPercent: 65.2, volume: 652000, trades: 145, winRate: 67 },
  { rank: 9, previousRank: 10, address: '0x9012...3456', displayName: 'Scalper99', pnl: 54800, pnlPercent: 54.8, volume: 548000, trades: 523, winRate: 58 },
  { rank: 10, previousRank: 9, address: '0x0123...4567', displayName: 'ProfitPro', pnl: 48900, pnlPercent: 48.9, volume: 489000, trades: 167, winRate: 61 },
  // User's position
  { rank: 156, previousRank: 162, address: '0xYOUR...ADDR', displayName: 'You', pnl: 2450, pnlPercent: 12.4, volume: 24500, trades: 34, winRate: 56, isYou: true },
];

const questLeaderboard: QuestLeaderboardEntry[] = [
  { rank: 1, previousRank: 1, address: '0xabc1...def2', displayName: 'QuestMaster', points: 45230, questsCompleted: 234, streak: 45, level: 78, badges: ['🏆', '👑', '⭐'], isKOL: true },
  { rank: 2, previousRank: 2, address: '0xbcd2...efg3', displayName: 'ContentKing', points: 38100, questsCompleted: 198, streak: 32, level: 65, badges: ['📺', '🎬', '✨'], isKOL: true },
  { rank: 3, previousRank: 4, address: '0xcde3...fgh4', displayName: 'SocialButterfly', points: 29870, questsCompleted: 167, streak: 28, level: 52, badges: ['🦋', '📱', '💫'], isKOL: true },
  { rank: 4, previousRank: 3, address: '0xdef4...ghi5', displayName: 'TraderPro', points: 27500, questsCompleted: 145, streak: 21, level: 48, badges: ['📊', '💰'] },
  { rank: 5, previousRank: 6, address: '0xefg5...hij6', displayName: 'CommunityHero', points: 24300, questsCompleted: 132, streak: 18, level: 44, badges: ['🤝', '🌟'], isKOL: true },
  { rank: 6, previousRank: 5, address: '0xfgh6...ijk7', displayName: 'DailyGrinder', points: 21800, questsCompleted: 289, streak: 67, level: 41, badges: ['🔥', '💪'] },
  { rank: 7, previousRank: 8, address: '0xghi7...jkl8', displayName: 'ReferralKing', points: 19500, questsCompleted: 87, streak: 12, level: 38, badges: ['👥', '🎁'] },
  { rank: 8, previousRank: 7, address: '0xhij8...klm9', displayName: 'VideoCreator', points: 17200, questsCompleted: 56, streak: 8, level: 35, badges: ['🎥', '📹'], isKOL: true },
  { rank: 9, previousRank: 10, address: '0xijk9...lmn0', displayName: 'TweetMachine', points: 15800, questsCompleted: 123, streak: 15, level: 32, badges: ['🐦', '💬'] },
  { rank: 10, previousRank: 9, address: '0xjkl0...mno1', displayName: 'AuraFan', points: 14500, questsCompleted: 98, streak: 9, level: 29, badges: ['💙', '🚀'] },
  // User's position
  { rank: 42, previousRank: 45, address: '0xYOUR...ADDR', displayName: 'You', points: 8500, questsCompleted: 47, streak: 5, level: 22, badges: ['🌱'], isYou: true },
];

const kolList = questLeaderboard.filter(e => e.isKOL);

// ============================================================================
// UTILITIES
// ============================================================================

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<'trading' | 'quests'>('trading');
  const [selectedCompetition, setSelectedCompetition] = useState(competitions[0]);
  const [tradingSort, setTradingSort] = useState<'pnl' | 'volume'>('pnl');
  const [questSort, setQuestSort] = useState<'points' | 'kol'>('points');

  const sortedTradingLeaderboard = useMemo(() => {
    const sorted = [...tradingLeaderboard].sort((a, b) => {
      if (tradingSort === 'pnl') return b.pnl - a.pnl;
      return b.volume - a.volume;
    });
    // Re-rank after sorting
    return sorted.map((entry, idx) => ({
      ...entry,
      rank: entry.isYou ? entry.rank : idx + 1,
    }));
  }, [tradingSort]);

  const displayedQuestLeaderboard = questSort === 'kol' ? kolList : questLeaderboard;

  return (
    <div className="oui-min-h-screen oui-bg-[#0a0e17]">
      {/* ======================================================================
          HEADER
      ====================================================================== */}
      <div className="oui-border-b oui-border-line oui-bg-base-8/50">
        <div className="oui-max-w-[1280px] oui-mx-auto oui-px-4 lg:oui-px-6 oui-py-6">
          <div className="oui-flex oui-items-center oui-justify-between oui-flex-wrap oui-gap-4">
            <div>
              <h1 className="oui-text-2xl lg:oui-text-3xl oui-font-bold oui-text-white oui-mb-1 oui-flex oui-items-center oui-gap-3">
                <Trophy className="oui-w-8 oui-h-8 oui-text-[#FFD700]" />
                Leaderboards
              </h1>
              <p className="oui-text-base-contrast-54">
                Compete with traders worldwide and climb the ranks
              </p>
            </div>

            <div className="oui-flex oui-items-center oui-gap-3">
              <Link
                to="/social"
                className="oui-px-4 oui-py-2 oui-text-sm oui-font-medium oui-text-base-contrast-54 oui-border oui-border-line oui-rounded-lg hover:oui-bg-base-8 oui-transition-colors oui-flex oui-items-center oui-gap-2"
              >
                <Target className="oui-w-4 oui-h-4" />
                Quests
              </Link>
              <Link
                to="/rewards"
                className="oui-px-4 oui-py-2 oui-text-sm oui-font-medium oui-text-base-contrast-54 oui-border oui-border-line oui-rounded-lg hover:oui-bg-base-8 oui-transition-colors oui-flex oui-items-center oui-gap-2"
              >
                <Zap className="oui-w-4 oui-h-4" />
                Rewards
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================================
          TABS
      ====================================================================== */}
      <div className="oui-border-b oui-border-line">
        <div className="oui-max-w-[1280px] oui-mx-auto oui-px-4 lg:oui-px-6">
          <div className="oui-flex oui-items-center oui-gap-1">
            <button
              onClick={() => setActiveTab('trading')}
              className={cn(
                "oui-px-6 oui-py-4 oui-text-sm oui-font-medium oui-border-b-2 oui-transition-colors oui-flex oui-items-center oui-gap-2",
                activeTab === 'trading'
                  ? "oui-border-[#FF9800] oui-text-white"
                  : "oui-border-transparent oui-text-base-contrast-54 hover:oui-text-white"
              )}
            >
              <BarChart3 className="oui-w-4 oui-h-4" />
              Trading Campaigns
            </button>
            <button
              onClick={() => setActiveTab('quests')}
              className={cn(
                "oui-px-6 oui-py-4 oui-text-sm oui-font-medium oui-border-b-2 oui-transition-colors oui-flex oui-items-center oui-gap-2",
                activeTab === 'quests'
                  ? "oui-border-[#00d4ff] oui-text-white"
                  : "oui-border-transparent oui-text-base-contrast-54 hover:oui-text-white"
              )}
            >
              <Star className="oui-w-4 oui-h-4" />
              Quest Rankings
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================================
          CONTENT
      ====================================================================== */}
      <div className="oui-max-w-[1280px] oui-mx-auto oui-px-4 lg:oui-px-6 oui-py-6">
        {activeTab === 'trading' ? (
          <TradingLeaderboardSection
            competitions={competitions}
            selectedCompetition={selectedCompetition}
            setSelectedCompetition={setSelectedCompetition}
            leaderboard={sortedTradingLeaderboard}
            sortBy={tradingSort}
            setSortBy={setTradingSort}
          />
        ) : (
          <QuestLeaderboardSection
            leaderboard={displayedQuestLeaderboard}
            fullLeaderboard={questLeaderboard}
            sortBy={questSort}
            setSortBy={setQuestSort}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// TRADING LEADERBOARD SECTION
// ============================================================================

interface TradingLeaderboardSectionProps {
  competitions: Competition[];
  selectedCompetition: Competition;
  setSelectedCompetition: (comp: Competition) => void;
  leaderboard: TradingLeaderboardEntry[];
  sortBy: 'pnl' | 'volume';
  setSortBy: (sort: 'pnl' | 'volume') => void;
}

function TradingLeaderboardSection({
  competitions,
  selectedCompetition,
  setSelectedCompetition,
  leaderboard,
  sortBy,
  setSortBy,
}: TradingLeaderboardSectionProps) {
  const userEntry = leaderboard.find(e => e.isYou);
  const top3 = leaderboard.filter(e => !e.isYou).slice(0, 3);
  const rest = leaderboard.filter(e => !e.isYou && e.rank > 3);

  return (
    <div className="oui-grid lg:oui-grid-cols-[320px_1fr] oui-gap-6">
      {/* Sidebar - Competition Selection */}
      <div className="oui-space-y-4">
        <h3 className="oui-text-sm oui-font-semibold oui-text-base-contrast-54 oui-uppercase">Active Competitions</h3>
        <div className="oui-space-y-3">
          {competitions.map((comp) => (
            <button
              key={comp.id}
              onClick={() => setSelectedCompetition(comp)}
              className={cn(
                "oui-w-full oui-text-left oui-p-4 oui-rounded-xl oui-border oui-transition-all",
                selectedCompetition.id === comp.id
                  ? "oui-bg-[#FF9800]/10 oui-border-[#FF9800]/50"
                  : "oui-bg-base-8 oui-border-line hover:oui-border-[#FF9800]/30"
              )}
            >
              <div className="oui-flex oui-items-center oui-justify-between oui-mb-2">
                <span className={cn(
                  "oui-px-2 oui-py-0.5 oui-text-xs oui-font-bold oui-rounded",
                  comp.type === 'pnl' ? "oui-bg-[#00E676]/20 oui-text-[#00E676]" : "oui-bg-[#2196F3]/20 oui-text-[#2196F3]"
                )}>
                  {comp.type === 'pnl' ? 'PnL %' : 'Volume'}
                </span>
                {comp.endsIn && (
                  <span className="oui-text-xs oui-text-base-contrast-54 oui-flex oui-items-center oui-gap-1">
                    <Clock className="oui-w-3 oui-h-3" />
                    {comp.endsIn}
                  </span>
                )}
              </div>
              <h4 className="oui-font-semibold oui-text-white oui-mb-1">{comp.name}</h4>
              <div className="oui-flex oui-items-center oui-gap-4 oui-text-sm">
                <span className="oui-text-[#FFD700] oui-font-semibold">${formatNumber(comp.prizePool)}</span>
                <span className="oui-text-base-contrast-54">{formatNumber(comp.participants)} traders</span>
              </div>
            </button>
          ))}
        </div>

        {/* Your Position Card */}
        {userEntry && (
          <div className="oui-bg-gradient-to-br oui-from-[#00d4ff]/10 oui-to-transparent oui-border oui-border-[#00d4ff]/30 oui-rounded-xl oui-p-4">
            <h4 className="oui-text-sm oui-font-semibold oui-text-[#00d4ff] oui-mb-3">Your Position</h4>
            <div className="oui-flex oui-items-center oui-justify-between oui-mb-2">
              <span className="oui-text-base-contrast-54">Rank</span>
              <div className="oui-flex oui-items-center oui-gap-2">
                <span className="oui-text-2xl oui-font-bold oui-text-white">#{userEntry.rank}</span>
                <RankChange current={userEntry.rank} previous={userEntry.previousRank} />
              </div>
            </div>
            <div className="oui-flex oui-items-center oui-justify-between oui-mb-2">
              <span className="oui-text-base-contrast-54">PnL</span>
              <span className="oui-font-semibold oui-text-[#00E676]">+${formatNumber(userEntry.pnl)}</span>
            </div>
            <div className="oui-flex oui-items-center oui-justify-between">
              <span className="oui-text-base-contrast-54">Volume</span>
              <span className="oui-font-semibold oui-text-white">${formatNumber(userEntry.volume)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Leaderboard */}
      <div>
        {/* Competition Header */}
        <div className="oui-bg-gradient-to-r oui-from-[#FF9800]/20 oui-via-transparent oui-to-transparent oui-border oui-border-[#FF9800]/30 oui-rounded-xl oui-p-6 oui-mb-6">
          <div className="oui-flex oui-items-center oui-justify-between oui-flex-wrap oui-gap-4">
            <div>
              <h2 className="oui-text-xl oui-font-bold oui-text-white oui-mb-1">{selectedCompetition.name}</h2>
              <p className="oui-text-base-contrast-54">{selectedCompetition.startDate} - {selectedCompetition.endDate}</p>
            </div>
            <div className="oui-flex oui-items-center oui-gap-6">
              <div className="oui-text-center">
                <p className="oui-text-2xl oui-font-bold oui-text-[#FFD700]">${formatNumber(selectedCompetition.prizePool)}</p>
                <p className="oui-text-xs oui-text-base-contrast-54">Prize Pool</p>
              </div>
              <div className="oui-text-center">
                <p className="oui-text-2xl oui-font-bold oui-text-white">{formatNumber(selectedCompetition.participants)}</p>
                <p className="oui-text-xs oui-text-base-contrast-54">Participants</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sort Tabs */}
        <div className="oui-flex oui-items-center oui-justify-between oui-mb-4">
          <div className="oui-flex oui-items-center oui-gap-2">
            <span className="oui-text-sm oui-text-base-contrast-54">Rank by:</span>
            <button
              onClick={() => setSortBy('pnl')}
              className={cn(
                "oui-px-3 oui-py-1.5 oui-text-sm oui-font-medium oui-rounded-lg oui-transition-colors",
                sortBy === 'pnl'
                  ? "oui-bg-[#00E676] oui-text-white"
                  : "oui-bg-base-7 oui-text-base-contrast-54 hover:oui-text-white"
              )}
            >
              PnL %
            </button>
            <button
              onClick={() => setSortBy('volume')}
              className={cn(
                "oui-px-3 oui-py-1.5 oui-text-sm oui-font-medium oui-rounded-lg oui-transition-colors",
                sortBy === 'volume'
                  ? "oui-bg-[#2196F3] oui-text-white"
                  : "oui-bg-base-7 oui-text-base-contrast-54 hover:oui-text-white"
              )}
            >
              Volume
            </button>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="oui-grid oui-grid-cols-3 oui-gap-4 oui-mb-6">
          {/* 2nd Place */}
          <div className="oui-order-1 oui-mt-8">
            <PodiumCard entry={top3[1]} place={2} />
          </div>
          {/* 1st Place */}
          <div className="oui-order-2">
            <PodiumCard entry={top3[0]} place={1} />
          </div>
          {/* 3rd Place */}
          <div className="oui-order-3 oui-mt-8">
            <PodiumCard entry={top3[2]} place={3} />
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="oui-bg-base-8 oui-border oui-border-line oui-rounded-xl oui-overflow-hidden">
          <table className="oui-w-full">
            <thead>
              <tr className="oui-border-b oui-border-line oui-text-sm oui-text-base-contrast-54">
                <th className="oui-px-4 oui-py-3 oui-text-left oui-font-medium">Rank</th>
                <th className="oui-px-4 oui-py-3 oui-text-left oui-font-medium">Trader</th>
                <th className="oui-px-4 oui-py-3 oui-text-right oui-font-medium">PnL</th>
                <th className="oui-px-4 oui-py-3 oui-text-right oui-font-medium oui-hidden md:oui-table-cell">Volume</th>
                <th className="oui-px-4 oui-py-3 oui-text-right oui-font-medium oui-hidden lg:oui-table-cell">Trades</th>
                <th className="oui-px-4 oui-py-3 oui-text-right oui-font-medium oui-hidden lg:oui-table-cell">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {rest.slice(0, 10).map((entry) => (
                <tr key={entry.rank} className="oui-border-b oui-border-line/50 hover:oui-bg-base-7/50 oui-transition-colors">
                  <td className="oui-px-4 oui-py-3">
                    <div className="oui-flex oui-items-center oui-gap-2">
                      <span className="oui-font-semibold oui-text-white">#{entry.rank}</span>
                      <RankChange current={entry.rank} previous={entry.previousRank} />
                    </div>
                  </td>
                  <td className="oui-px-4 oui-py-3">
                    <div className="oui-flex oui-items-center oui-gap-2">
                      <div className="oui-w-8 oui-h-8 oui-rounded-full oui-bg-base-6 oui-flex oui-items-center oui-justify-center oui-text-sm oui-font-semibold oui-text-white">
                        {entry.displayName.charAt(0)}
                      </div>
                      <div>
                        <p className="oui-font-medium oui-text-white">{entry.displayName}</p>
                        <p className="oui-text-xs oui-text-base-contrast-36">{entry.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="oui-px-4 oui-py-3 oui-text-right">
                    <p className="oui-font-semibold oui-text-[#00E676]">+${formatNumber(entry.pnl)}</p>
                    <p className="oui-text-xs oui-text-base-contrast-54">+{entry.pnlPercent}%</p>
                  </td>
                  <td className="oui-px-4 oui-py-3 oui-text-right oui-hidden md:oui-table-cell">
                    <p className="oui-font-medium oui-text-white">${formatNumber(entry.volume)}</p>
                  </td>
                  <td className="oui-px-4 oui-py-3 oui-text-right oui-hidden lg:oui-table-cell">
                    <p className="oui-text-white">{entry.trades}</p>
                  </td>
                  <td className="oui-px-4 oui-py-3 oui-text-right oui-hidden lg:oui-table-cell">
                    <p className="oui-text-white">{entry.winRate}%</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// QUEST LEADERBOARD SECTION
// ============================================================================

interface QuestLeaderboardSectionProps {
  leaderboard: QuestLeaderboardEntry[];
  fullLeaderboard: QuestLeaderboardEntry[];
  sortBy: 'points' | 'kol';
  setSortBy: (sort: 'points' | 'kol') => void;
}

function QuestLeaderboardSection({
  leaderboard,
  fullLeaderboard,
  sortBy,
  setSortBy,
}: QuestLeaderboardSectionProps) {
  const userEntry = fullLeaderboard.find(e => e.isYou);
  const kolCount = fullLeaderboard.filter(e => e.isKOL).length;

  return (
    <div className="oui-grid lg:oui-grid-cols-[320px_1fr] oui-gap-6">
      {/* Sidebar */}
      <div className="oui-space-y-4">
        {/* Your Stats */}
        {userEntry && (
          <div className="oui-bg-gradient-to-br oui-from-[#00d4ff]/10 oui-to-transparent oui-border oui-border-[#00d4ff]/30 oui-rounded-xl oui-p-4">
            <h4 className="oui-text-sm oui-font-semibold oui-text-[#00d4ff] oui-mb-3">Your Stats</h4>
            <div className="oui-space-y-2">
              <div className="oui-flex oui-items-center oui-justify-between">
                <span className="oui-text-base-contrast-54">Rank</span>
                <div className="oui-flex oui-items-center oui-gap-2">
                  <span className="oui-text-xl oui-font-bold oui-text-white">#{userEntry.rank}</span>
                  <RankChange current={userEntry.rank} previous={userEntry.previousRank} />
                </div>
              </div>
              <div className="oui-flex oui-items-center oui-justify-between">
                <span className="oui-text-base-contrast-54">Points</span>
                <span className="oui-font-semibold oui-text-[#FFD700]">{formatNumber(userEntry.points)}</span>
              </div>
              <div className="oui-flex oui-items-center oui-justify-between">
                <span className="oui-text-base-contrast-54">Level</span>
                <span className="oui-font-semibold oui-text-white">Lv.{userEntry.level}</span>
              </div>
              <div className="oui-flex oui-items-center oui-justify-between">
                <span className="oui-text-base-contrast-54">Streak</span>
                <span className="oui-font-semibold oui-text-[#FF9800] oui-flex oui-items-center oui-gap-1">
                  <Flame className="oui-w-4 oui-h-4" />
                  {userEntry.streak} days
                </span>
              </div>
              <div className="oui-flex oui-items-center oui-justify-between">
                <span className="oui-text-base-contrast-54">Quests Done</span>
                <span className="oui-font-semibold oui-text-white">{userEntry.questsCompleted}</span>
              </div>
            </div>
          </div>
        )}

        {/* KOL Status Explanation */}
        <div className="oui-bg-base-8 oui-border oui-border-line oui-rounded-xl oui-p-4">
          <div className="oui-flex oui-items-center oui-gap-2 oui-mb-3">
            <Crown className="oui-w-5 oui-h-5 oui-text-[#E040FB]" />
            <h4 className="oui-font-semibold oui-text-white">KOL Status</h4>
          </div>
          <p className="oui-text-sm oui-text-base-contrast-54 oui-mb-3">
            Key Opinion Leaders earn exclusive rewards and early access to campaigns.
          </p>
          <div className="oui-space-y-2 oui-text-sm">
            <div className="oui-flex oui-items-start oui-gap-2">
              <Check className="oui-w-4 oui-h-4 oui-text-[#00E676] oui-mt-0.5" />
              <span className="oui-text-base-contrast-54">Complete 100+ social quests</span>
            </div>
            <div className="oui-flex oui-items-start oui-gap-2">
              <Check className="oui-w-4 oui-h-4 oui-text-[#00E676] oui-mt-0.5" />
              <span className="oui-text-base-contrast-54">Reach 20,000+ points</span>
            </div>
            <div className="oui-flex oui-items-start oui-gap-2">
              <Check className="oui-w-4 oui-h-4 oui-text-[#00E676] oui-mt-0.5" />
              <span className="oui-text-base-contrast-54">Maintain 14+ day streak</span>
            </div>
          </div>
          <div className="oui-mt-4 oui-pt-3 oui-border-t oui-border-line">
            <p className="oui-text-xs oui-text-base-contrast-36">
              Current KOLs: <span className="oui-text-[#E040FB] oui-font-semibold">{kolCount}</span>
            </p>
          </div>
        </div>

        {/* Badge Legend */}
        <div className="oui-bg-base-8 oui-border oui-border-line oui-rounded-xl oui-p-4">
          <h4 className="oui-font-semibold oui-text-white oui-mb-3 oui-flex oui-items-center oui-gap-2">
            <Award className="oui-w-4 oui-h-4 oui-text-[#FFD700]" />
            Badge Legend
          </h4>
          <div className="oui-grid oui-grid-cols-2 oui-gap-2 oui-text-sm">
            <div className="oui-flex oui-items-center oui-gap-2">
              <span>🏆</span>
              <span className="oui-text-base-contrast-54">Champion</span>
            </div>
            <div className="oui-flex oui-items-center oui-gap-2">
              <span>👑</span>
              <span className="oui-text-base-contrast-54">Top 10</span>
            </div>
            <div className="oui-flex oui-items-center oui-gap-2">
              <span>📺</span>
              <span className="oui-text-base-contrast-54">Video Creator</span>
            </div>
            <div className="oui-flex oui-items-center oui-gap-2">
              <span>🐦</span>
              <span className="oui-text-base-contrast-54">Twitter Star</span>
            </div>
            <div className="oui-flex oui-items-center oui-gap-2">
              <span>👥</span>
              <span className="oui-text-base-contrast-54">Referral King</span>
            </div>
            <div className="oui-flex oui-items-center oui-gap-2">
              <span>🔥</span>
              <span className="oui-text-base-contrast-54">Streak Master</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Leaderboard */}
      <div>
        {/* Header */}
        <div className="oui-bg-gradient-to-r oui-from-[#00d4ff]/20 oui-via-transparent oui-to-transparent oui-border oui-border-[#00d4ff]/30 oui-rounded-xl oui-p-6 oui-mb-6">
          <div className="oui-flex oui-items-center oui-justify-between oui-flex-wrap oui-gap-4">
            <div>
              <h2 className="oui-text-xl oui-font-bold oui-text-white oui-mb-1">Quest Rankings</h2>
              <p className="oui-text-base-contrast-54">Earn points by completing quests and social tasks</p>
            </div>
            <div className="oui-flex oui-items-center oui-gap-4">
              <div className="oui-text-center">
                <p className="oui-text-2xl oui-font-bold oui-text-[#FFD700]">{formatNumber(fullLeaderboard[0]?.points || 0)}</p>
                <p className="oui-text-xs oui-text-base-contrast-54">#1 Points</p>
              </div>
              <div className="oui-text-center">
                <p className="oui-text-2xl oui-font-bold oui-text-[#E040FB]">{kolCount}</p>
                <p className="oui-text-xs oui-text-base-contrast-54">Active KOLs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sort Tabs */}
        <div className="oui-flex oui-items-center oui-justify-between oui-mb-4">
          <div className="oui-flex oui-items-center oui-gap-2">
            <span className="oui-text-sm oui-text-base-contrast-54">View:</span>
            <button
              onClick={() => setSortBy('points')}
              className={cn(
                "oui-px-3 oui-py-1.5 oui-text-sm oui-font-medium oui-rounded-lg oui-transition-colors oui-flex oui-items-center oui-gap-1",
                sortBy === 'points'
                  ? "oui-bg-[#FFD700] oui-text-black"
                  : "oui-bg-base-7 oui-text-base-contrast-54 hover:oui-text-white"
              )}
            >
              <Star className="oui-w-4 oui-h-4" />
              All by Points
            </button>
            <button
              onClick={() => setSortBy('kol')}
              className={cn(
                "oui-px-3 oui-py-1.5 oui-text-sm oui-font-medium oui-rounded-lg oui-transition-colors oui-flex oui-items-center oui-gap-1",
                sortBy === 'kol'
                  ? "oui-bg-[#E040FB] oui-text-white"
                  : "oui-bg-base-7 oui-text-base-contrast-54 hover:oui-text-white"
              )}
            >
              <Crown className="oui-w-4 oui-h-4" />
              KOLs Only
            </button>
          </div>
        </div>

        {/* Leaderboard Cards */}
        <div className="oui-space-y-3">
          {leaderboard.filter(e => !e.isYou).map((entry, idx) => (
            <QuestLeaderboardCard key={entry.address} entry={entry} displayRank={idx + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function PodiumCard({ entry, place }: { entry?: TradingLeaderboardEntry; place: number }) {
  if (!entry) return null;

  const placeConfig = {
    1: { color: '#FFD700', icon: Crown, height: 'oui-h-32', prize: '$25,000' },
    2: { color: '#C0C0C0', icon: Medal, height: 'oui-h-24', prize: '$12,500' },
    3: { color: '#CD7F32', icon: Medal, height: 'oui-h-20', prize: '$7,500' },
  }[place]!;

  const PlaceIcon = placeConfig.icon;

  return (
    <div className="oui-bg-base-8 oui-border oui-border-line oui-rounded-xl oui-p-4 oui-text-center hover:oui-border-opacity-50 oui-transition-all" style={{ borderColor: `${placeConfig.color}30` }}>
      <div className="oui-flex oui-justify-center oui-mb-3">
        <div
          className="oui-w-12 oui-h-12 oui-rounded-full oui-flex oui-items-center oui-justify-center"
          style={{ backgroundColor: `${placeConfig.color}20` }}
        >
          <PlaceIcon className="oui-w-6 oui-h-6" style={{ color: placeConfig.color }} />
        </div>
      </div>
      <p className="oui-font-semibold oui-text-white oui-mb-1">{entry.displayName}</p>
      <p className="oui-text-xs oui-text-base-contrast-54 oui-mb-2">{entry.address}</p>
      <p className="oui-text-xl oui-font-bold oui-text-[#00E676] oui-mb-1">+{entry.pnlPercent}%</p>
      <p className="oui-text-sm oui-text-base-contrast-54">${formatNumber(entry.volume)} vol</p>
      <div className="oui-mt-3 oui-pt-3 oui-border-t oui-border-line">
        <p className="oui-text-lg oui-font-bold" style={{ color: placeConfig.color }}>{placeConfig.prize}</p>
        <p className="oui-text-xs oui-text-base-contrast-54">Prize</p>
      </div>
    </div>
  );
}

function QuestLeaderboardCard({ entry, displayRank }: { entry: QuestLeaderboardEntry; displayRank: number }) {
  const rankColors: Record<number, string> = {
    1: '#FFD700',
    2: '#C0C0C0',
    3: '#CD7F32',
  };

  return (
    <div className={cn(
      "oui-bg-base-8 oui-border oui-border-line oui-rounded-xl oui-p-4 hover:oui-border-[#00d4ff]/30 oui-transition-all",
      entry.isKOL && "oui-border-[#E040FB]/30 oui-bg-[#E040FB]/5"
    )}>
      <div className="oui-flex oui-items-center oui-gap-4">
        {/* Rank */}
        <div className="oui-w-12 oui-text-center">
          <span
            className="oui-text-xl oui-font-bold"
            style={{ color: rankColors[displayRank] || '#fff' }}
          >
            #{displayRank}
          </span>
          <RankChange current={entry.rank} previous={entry.previousRank} />
        </div>

        {/* Avatar & Name */}
        <div className="oui-flex oui-items-center oui-gap-3 oui-flex-1">
          <div className="oui-relative">
            <div className="oui-w-10 oui-h-10 oui-rounded-full oui-bg-base-6 oui-flex oui-items-center oui-justify-center oui-text-lg oui-font-semibold oui-text-white">
              {entry.displayName.charAt(0)}
            </div>
            {entry.isKOL && (
              <div className="oui-absolute -oui-bottom-1 -oui-right-1 oui-w-5 oui-h-5 oui-rounded-full oui-bg-[#E040FB] oui-flex oui-items-center oui-justify-center">
                <Crown className="oui-w-3 oui-h-3 oui-text-white" />
              </div>
            )}
          </div>
          <div>
            <div className="oui-flex oui-items-center oui-gap-2">
              <p className="oui-font-semibold oui-text-white">{entry.displayName}</p>
              {entry.isKOL && (
                <span className="oui-px-1.5 oui-py-0.5 oui-text-[10px] oui-font-bold oui-rounded oui-bg-[#E040FB]/20 oui-text-[#E040FB]">KOL</span>
              )}
            </div>
            <p className="oui-text-xs oui-text-base-contrast-36">Lv.{entry.level} • {entry.questsCompleted} quests</p>
          </div>
        </div>

        {/* Badges */}
        <div className="oui-flex oui-items-center oui-gap-1 oui-hidden md:oui-flex">
          {entry.badges.map((badge, i) => (
            <span key={i} className="oui-text-lg">{badge}</span>
          ))}
        </div>

        {/* Stats */}
        <div className="oui-flex oui-items-center oui-gap-6">
          <div className="oui-text-center oui-hidden sm:oui-block">
            <p className="oui-font-semibold oui-text-[#FF9800] oui-flex oui-items-center oui-justify-center oui-gap-1">
              <Flame className="oui-w-4 oui-h-4" />
              {entry.streak}
            </p>
            <p className="oui-text-xs oui-text-base-contrast-54">Streak</p>
          </div>
          <div className="oui-text-center">
            <p className="oui-text-xl oui-font-bold oui-text-[#FFD700]">{formatNumber(entry.points)}</p>
            <p className="oui-text-xs oui-text-base-contrast-54">Points</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RankChange({ current, previous }: { current: number; previous?: number }) {
  if (!previous || current === previous) {
    return <Minus className="oui-w-3 oui-h-3 oui-text-base-contrast-36" />;
  }
  if (current < previous) {
    return (
      <span className="oui-flex oui-items-center oui-text-[#00E676] oui-text-xs">
        <ArrowUp className="oui-w-3 oui-h-3" />
        {previous - current}
      </span>
    );
  }
  return (
    <span className="oui-flex oui-items-center oui-text-[#F44336] oui-text-xs">
      <ArrowDown className="oui-w-3 oui-h-3" />
      {current - previous}
    </span>
  );
}
