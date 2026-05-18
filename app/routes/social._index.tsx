import { useState, useMemo } from "react";
import { Link } from "@remix-run/react";
import {
  Gift,
  Check,
  Trophy,
  Users,
  Star,
  ChevronRight,
  ChevronDown,
  Zap,
  Youtube,
  Twitter,
  UserPlus,
  TrendingUp,
  Award,
  Calendar,
  DollarSign,
  BarChart3,
  Sparkles,
  ExternalLink,
  Play,
  Share2,
  Timer,
  Clock,
  Filter,
  ArrowUpRight,
  Target,
  MessageCircle,
  Wallet,
  CheckCircle,
  Percent,
  Eye,
  Shield,
  ArrowRight,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

type QuestCategory = 'trading' | 'social';
type QuestStatus = 'available' | 'in_progress' | 'claimable' | 'claimed';
type CampaignType = 'trading_competition' | 'new_listing';
type CampaignStatus = 'upcoming' | 'active' | 'ending_soon' | 'ended';

interface Quest {
  id: string;
  category: QuestCategory;
  subcategory: string;
  title: string;
  description: string;
  icon: any;
  iconColor: string;
  reward: { token: string; amount: string; xp: number };
  progress: number;
  target: number;
  unit: string;
  status: QuestStatus;
  expiresIn?: string;
  isNew?: boolean;
  isHot?: boolean;
  requirements?: string[];
}

interface Campaign {
  id: string;
  type: CampaignType;
  title: string;
  description: string;
  tokenSymbol?: string;
  tokenLogo?: string;
  tradingPair?: string;
  prizePool: { amount: number; token: string };
  feeDiscount?: { maker: number; taker: number; duration: string };
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  participants: number;
  totalVolume: number;
  leaderboard: { rank: number; name: string; value: string }[];
}

// ============================================================================
// MOCK DATA
// ============================================================================

const quests: Quest[] = [
  // Trading Quests - Daily
  {
    id: 'tq-d1',
    category: 'trading',
    subcategory: 'Daily',
    title: 'Daily Volume Target',
    description: 'Trade $10,000 in volume today',
    icon: BarChart3,
    iconColor: '#00E676',
    reward: { token: 'AURA', amount: '50', xp: 200 },
    progress: 7250,
    target: 10000,
    unit: 'USD',
    status: 'in_progress',
    expiresIn: '8h 32m',
    isHot: true,
  },
  {
    id: 'tq-d2',
    category: 'trading',
    subcategory: 'Daily',
    title: 'Execute 5 Trades',
    description: 'Complete 5 separate trades',
    icon: Target,
    iconColor: '#00E676',
    reward: { token: 'AURA', amount: '25', xp: 100 },
    progress: 3,
    target: 5,
    unit: 'trades',
    status: 'in_progress',
    expiresIn: '8h 32m',
  },
  {
    id: 'tq-d3',
    category: 'trading',
    subcategory: 'Daily',
    title: 'Explore 3 Markets',
    description: 'Trade on 3 different pairs',
    icon: Sparkles,
    iconColor: '#00E676',
    reward: { token: 'AURA', amount: '30', xp: 150 },
    progress: 3,
    target: 3,
    unit: 'pairs',
    status: 'claimable',
    expiresIn: '8h 32m',
  },
  // Trading Quests - Weekly
  {
    id: 'tq-w1',
    category: 'trading',
    subcategory: 'Weekly',
    title: 'Weekly Volume Champion',
    description: 'Trade $100,000 this week',
    icon: Trophy,
    iconColor: '#FF9800',
    reward: { token: 'USDC', amount: '100', xp: 1000 },
    progress: 42500,
    target: 100000,
    unit: 'USD',
    status: 'in_progress',
    expiresIn: '5d 8h',
    isNew: true,
  },
  {
    id: 'tq-w2',
    category: 'trading',
    subcategory: 'Weekly',
    title: 'Profitable Week',
    description: 'End the week with positive PnL',
    icon: TrendingUp,
    iconColor: '#FF9800',
    reward: { token: 'AURA', amount: '200', xp: 750 },
    progress: 1,
    target: 1,
    unit: 'positive PnL',
    status: 'in_progress',
    expiresIn: '5d 8h',
  },
  // Social Quests
  {
    id: 'sq-1',
    category: 'social',
    subcategory: 'Twitter',
    title: 'Share PnL Card',
    description: 'Tweet your trading results with #AuraTrading',
    icon: Twitter,
    iconColor: '#1DA1F2',
    reward: { token: 'AURA', amount: '50', xp: 500 },
    progress: 0,
    target: 1,
    unit: 'post',
    status: 'available',
    isNew: true,
    requirements: [
      'Use the Share PnL feature',
      'Include #AuraTrading hashtag',
      'Tag @AuraDEX',
    ],
  },
  {
    id: 'sq-2',
    category: 'social',
    subcategory: 'YouTube',
    title: 'Create YouTube Review',
    description: 'Make a video showcasing Aura DEX',
    icon: Youtube,
    iconColor: '#FF0000',
    reward: { token: 'USDC', amount: '75', xp: 2500 },
    progress: 0,
    target: 1,
    unit: 'video',
    status: 'available',
    isHot: true,
    requirements: [
      'Video must be 5+ minutes',
      'Show actual trading on Aura',
      'Include referral link in description',
    ],
  },
  {
    id: 'sq-3',
    category: 'social',
    subcategory: 'Community',
    title: 'Join Discord',
    description: 'Verify your wallet in our Discord',
    icon: MessageCircle,
    iconColor: '#5865F2',
    reward: { token: 'AURA', amount: '25', xp: 100 },
    progress: 1,
    target: 1,
    unit: 'action',
    status: 'claimed',
  },
  {
    id: 'sq-4',
    category: 'social',
    subcategory: 'Referral',
    title: 'Invite 3 Friends',
    description: 'Earn when your friends trade',
    icon: UserPlus,
    iconColor: '#E040FB',
    reward: { token: 'USDC', amount: '90', xp: 1500 },
    progress: 1,
    target: 3,
    unit: 'referrals',
    status: 'in_progress',
  },
  {
    id: 'sq-5',
    category: 'social',
    subcategory: 'Governance',
    title: 'Vote on Proposal #12',
    description: 'Participate in governance voting',
    icon: Shield,
    iconColor: '#9C27B0',
    reward: { token: 'AURA', amount: '100', xp: 500 },
    progress: 0,
    target: 1,
    unit: 'vote',
    status: 'available',
    expiresIn: '2d 5h',
  },
];

const campaigns: Campaign[] = [
  {
    id: 'camp-1',
    type: 'trading_competition',
    title: 'February Trading Championship',
    description: 'Compete for the biggest PnL percentage gains this month. Top 5 traders share the prize pool.',
    prizePool: { amount: 50000, token: 'USDC' },
    startDate: 'Feb 1',
    endDate: 'Feb 28',
    status: 'active',
    participants: 1247,
    totalVolume: 15420000,
    leaderboard: [
      { rank: 1, name: 'WhaleHunter', value: '+284.5%' },
      { rank: 2, name: 'DeFiKing', value: '+198.2%' },
      { rank: 3, name: 'TradeMaster', value: '+154.7%' },
    ],
  },
  {
    id: 'camp-2',
    type: 'new_listing',
    title: 'ARB Token Launch Event',
    description: 'Celebrate Arbitrum listing with zero maker fees and exclusive rewards.',
    tokenSymbol: 'ARB',
    tokenLogo: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
    tradingPair: 'PERP_ARB_USDC',
    prizePool: { amount: 10000, token: 'ARB' },
    feeDiscount: { maker: 100, taker: 50, duration: '7 days' },
    startDate: 'Jan 28',
    endDate: 'Feb 4',
    status: 'active',
    participants: 523,
    totalVolume: 8750000,
    leaderboard: [
      { rank: 1, name: 'ARB_Maxi', value: '$45,230' },
      { rank: 2, name: 'LayerTwo', value: '$38,100' },
      { rank: 3, name: 'Rollup_King', value: '$29,870' },
    ],
  },
  {
    id: 'camp-3',
    type: 'trading_competition',
    title: 'Weekly Sprint #8',
    description: 'Quick 7-day competition focused on absolute PnL gains.',
    prizePool: { amount: 10000, token: 'USDC' },
    startDate: 'Jan 27',
    endDate: 'Feb 3',
    status: 'ending_soon',
    participants: 389,
    totalVolume: 4250000,
    leaderboard: [
      { rank: 1, name: 'QuickFlip', value: '$12,450' },
      { rank: 2, name: 'DayTrader', value: '$9,800' },
      { rank: 3, name: 'Scalper99', value: '$7,650' },
    ],
  },
  {
    id: 'camp-4',
    type: 'new_listing',
    title: 'SEI Network Launch',
    description: 'SEI token listing with reduced fees for early traders.',
    tokenSymbol: 'SEI',
    tokenLogo: 'https://cryptologos.cc/logos/sei-sei-logo.png',
    tradingPair: 'PERP_SEI_USDC',
    prizePool: { amount: 25000, token: 'SEI' },
    feeDiscount: { maker: 100, taker: 75, duration: '7 days' },
    startDate: 'Feb 5',
    endDate: 'Feb 12',
    status: 'upcoming',
    participants: 0,
    totalVolume: 0,
    leaderboard: [],
  },
];

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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SocialPage() {
  const [activeSection, setActiveSection] = useState<'quests' | 'campaigns'>('quests');
  const [questCategory, setQuestCategory] = useState<'all' | 'trading' | 'social'>('all');
  const [questFilter, setQuestFilter] = useState<'all' | 'available' | 'in_progress' | 'claimable'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredQuests = useMemo(() => {
    let filtered = quests.filter(q => q.status !== 'claimed');
    if (questCategory !== 'all') {
      filtered = filtered.filter(q => q.category === questCategory);
    }
    if (questFilter !== 'all') {
      filtered = filtered.filter(q => q.status === questFilter);
    }
    return filtered;
  }, [questCategory, questFilter]);

  const claimableCount = quests.filter(q => q.status === 'claimable').length;
  const activeCampaigns = campaigns.filter(c => c.status === 'active' || c.status === 'ending_soon');

  return (
    <div className="oui-min-h-screen oui-bg-[#0a0e17]">
      {/* ======================================================================
          HEADER
      ====================================================================== */}
      <div className="oui-border-b oui-border-line oui-bg-base-8/50">
        <div className="oui-max-w-[1280px] oui-mx-auto oui-px-4 lg:oui-px-6 oui-py-6">
          <div className="oui-flex oui-items-center oui-justify-between oui-flex-wrap oui-gap-4">
            <div>
              <h1 className="oui-text-2xl lg:oui-text-3xl oui-font-bold oui-text-white oui-mb-1">
                Quests & Campaigns
              </h1>
              <p className="oui-text-base-contrast-54">
                Complete tasks and join campaigns to earn rewards
              </p>
            </div>

            <div className="oui-flex oui-items-center oui-gap-3">
              {claimableCount > 0 && (
                <button className="oui-px-4 oui-py-2 oui-text-sm oui-font-semibold oui-text-white oui-bg-[#00E676] hover:oui-bg-[#00C853] oui-rounded-lg oui-transition-all oui-flex oui-items-center oui-gap-2">
                  <Gift className="oui-w-4 oui-h-4" />
                  Claim {claimableCount} Rewards
                </button>
              )}
              <Link
                to="/leaderboard"
                className="oui-px-4 oui-py-2 oui-text-sm oui-font-medium oui-text-base-contrast-54 oui-border oui-border-line oui-rounded-lg hover:oui-bg-base-8 oui-transition-colors oui-flex oui-items-center oui-gap-2"
              >
                <Trophy className="oui-w-4 oui-h-4" />
                Leaderboards
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================================
          SECTION TABS
      ====================================================================== */}
      <div className="oui-border-b oui-border-line">
        <div className="oui-max-w-[1280px] oui-mx-auto oui-px-4 lg:oui-px-6">
          <div className="oui-flex oui-items-center oui-gap-1">
            <button
              onClick={() => setActiveSection('quests')}
              className={cn(
                "oui-px-6 oui-py-4 oui-text-sm oui-font-medium oui-border-b-2 oui-transition-colors oui-flex oui-items-center oui-gap-2",
                activeSection === 'quests'
                  ? "oui-border-[#00d4ff] oui-text-white"
                  : "oui-border-transparent oui-text-base-contrast-54 hover:oui-text-white"
              )}
            >
              <Target className="oui-w-4 oui-h-4" />
              Quests
              {claimableCount > 0 && (
                <span className="oui-w-5 oui-h-5 oui-rounded-full oui-bg-[#00E676] oui-text-white oui-text-xs oui-font-bold oui-flex oui-items-center oui-justify-center">
                  {claimableCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveSection('campaigns')}
              className={cn(
                "oui-px-6 oui-py-4 oui-text-sm oui-font-medium oui-border-b-2 oui-transition-colors oui-flex oui-items-center oui-gap-2",
                activeSection === 'campaigns'
                  ? "oui-border-[#00d4ff] oui-text-white"
                  : "oui-border-transparent oui-text-base-contrast-54 hover:oui-text-white"
              )}
            >
              <Zap className="oui-w-4 oui-h-4" />
              Campaigns
              <span className="oui-px-1.5 oui-py-0.5 oui-text-[10px] oui-font-bold oui-rounded oui-bg-[#FF9800] oui-text-white">
                {activeCampaigns.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================================
          MAIN CONTENT
      ====================================================================== */}
      <div className="oui-max-w-[1280px] oui-mx-auto oui-px-4 lg:oui-px-6 oui-py-6">
        {activeSection === 'quests' ? (
          <div>
            {/* Quest Filters */}
            <div className="oui-flex oui-items-center oui-justify-between oui-mb-6 oui-flex-wrap oui-gap-4">
              {/* Category Tabs */}
              <div className="oui-flex oui-items-center oui-gap-2 oui-p-1 oui-bg-base-8 oui-rounded-xl oui-border oui-border-line">
                {[
                  { id: 'all', label: 'All Quests', icon: Target },
                  { id: 'trading', label: 'Trading', icon: BarChart3, color: '#00E676' },
                  { id: 'social', label: 'Social', icon: Share2, color: '#2196F3' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setQuestCategory(tab.id as any)}
                    className={cn(
                      "oui-px-4 oui-py-2 oui-text-sm oui-font-medium oui-rounded-lg oui-transition-all oui-flex oui-items-center oui-gap-2",
                      questCategory === tab.id
                        ? "oui-text-white oui-shadow-lg"
                        : "oui-text-base-contrast-54 hover:oui-text-white"
                    )}
                    style={questCategory === tab.id ? { backgroundColor: tab.color || '#00d4ff' } : {}}
                  >
                    <tab.icon className="oui-w-4 oui-h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="oui-px-4 oui-py-2 oui-text-sm oui-font-medium oui-text-base-contrast-54 oui-border oui-border-line oui-rounded-lg hover:oui-bg-base-8 oui-transition-colors oui-flex oui-items-center oui-gap-2"
              >
                <Filter className="oui-w-4 oui-h-4" />
                Filter
                <ChevronDown className={cn("oui-w-4 oui-h-4 oui-transition-transform", showFilters && "oui-rotate-180")} />
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="oui-mb-6 oui-p-4 oui-bg-base-8 oui-border oui-border-line oui-rounded-xl">
                <div className="oui-flex oui-items-center oui-gap-2 oui-flex-wrap">
                  <span className="oui-text-sm oui-text-base-contrast-54 oui-mr-2">Status:</span>
                  {(['all', 'available', 'in_progress', 'claimable'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setQuestFilter(status)}
                      className={cn(
                        "oui-px-3 oui-py-1.5 oui-text-xs oui-font-medium oui-rounded-lg oui-transition-colors oui-capitalize",
                        questFilter === status
                          ? "oui-bg-[#00d4ff] oui-text-white"
                          : "oui-bg-base-7 oui-text-base-contrast-54 hover:oui-text-white"
                      )}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quest List */}
            <div className="oui-space-y-3">
              {filteredQuests.length > 0 ? (
                filteredQuests.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} />
                ))
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        ) : (
          <div className="oui-space-y-6">
            {/* Active Campaigns */}
            <div>
              <h2 className="oui-text-lg oui-font-semibold oui-text-white oui-mb-4 oui-flex oui-items-center oui-gap-2">
                <Zap className="oui-w-5 oui-h-5 oui-text-[#FF9800]" />
                Active Campaigns
              </h2>
              <div className="oui-grid md:oui-grid-cols-2 oui-gap-4">
                {campaigns.filter(c => c.status === 'active' || c.status === 'ending_soon').map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            </div>

            {/* Upcoming Campaigns */}
            {campaigns.filter(c => c.status === 'upcoming').length > 0 && (
              <div>
                <h2 className="oui-text-lg oui-font-semibold oui-text-white oui-mb-4 oui-flex oui-items-center oui-gap-2">
                  <Calendar className="oui-w-5 oui-h-5 oui-text-[#2196F3]" />
                  Upcoming
                </h2>
                <div className="oui-grid md:oui-grid-cols-2 oui-gap-4">
                  {campaigns.filter(c => c.status === 'upcoming').map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT: Quest Card
// ============================================================================

function QuestCard({ quest }: { quest: Quest }) {
  const QuestIcon = quest.icon;
  const progressPercent = (quest.progress / quest.target) * 100;
  const isClaimable = quest.status === 'claimable';

  return (
    <div
      className={cn(
        "oui-bg-base-8 oui-border oui-rounded-xl oui-p-4 oui-transition-all hover:oui-shadow-lg",
        isClaimable
          ? "oui-border-[#00E676]/50 oui-bg-[#00E676]/5"
          : "oui-border-line hover:oui-border-[#00d4ff]/30"
      )}
    >
      <div className="oui-flex oui-items-start oui-gap-4">
        {/* Icon */}
        <div
          className="oui-w-12 oui-h-12 oui-rounded-xl oui-flex oui-items-center oui-justify-center oui-flex-shrink-0"
          style={{ backgroundColor: `${quest.iconColor}15` }}
        >
          <QuestIcon className="oui-w-6 oui-h-6" style={{ color: quest.iconColor }} />
        </div>

        {/* Content */}
        <div className="oui-flex-1 oui-min-w-0">
          <div className="oui-flex oui-items-center oui-gap-2 oui-mb-1 oui-flex-wrap">
            <span className="oui-text-xs oui-text-base-contrast-36 oui-uppercase">{quest.subcategory}</span>
            {quest.isNew && (
              <span className="oui-px-1.5 oui-py-0.5 oui-text-[10px] oui-font-bold oui-rounded oui-bg-[#00d4ff] oui-text-white">NEW</span>
            )}
            {quest.isHot && (
              <span className="oui-px-1.5 oui-py-0.5 oui-text-[10px] oui-font-bold oui-rounded oui-bg-[#FF5722] oui-text-white">HOT</span>
            )}
          </div>
          <h4 className="oui-text-base oui-font-semibold oui-text-white oui-mb-1">{quest.title}</h4>
          <p className="oui-text-sm oui-text-base-contrast-54">{quest.description}</p>

          {/* Requirements for social quests */}
          {quest.requirements && quest.status === 'available' && (
            <div className="oui-mt-2 oui-text-xs oui-text-base-contrast-36">
              {quest.requirements.slice(0, 2).map((req, i) => (
                <span key={i}>• {req}{i < 1 && quest.requirements!.length > 1 ? ' ' : ''}</span>
              ))}
            </div>
          )}

          {/* Progress */}
          <div className="oui-mt-3">
            <div className="oui-flex oui-items-center oui-justify-between oui-text-xs oui-mb-1">
              <span className="oui-text-base-contrast-54">
                {formatNumber(quest.progress)} / {formatNumber(quest.target)} {quest.unit}
              </span>
              {quest.expiresIn && (
                <span className="oui-text-base-contrast-36 oui-flex oui-items-center oui-gap-1">
                  <Clock className="oui-w-3 oui-h-3" />
                  {quest.expiresIn}
                </span>
              )}
            </div>
            <div className="oui-h-2 oui-bg-base-6 oui-rounded-full oui-overflow-hidden">
              <div
                className="oui-h-full oui-rounded-full oui-transition-all oui-duration-500"
                style={{
                  width: `${Math.min(progressPercent, 100)}%`,
                  backgroundColor: isClaimable ? '#00E676' : quest.iconColor,
                }}
              />
            </div>
          </div>
        </div>

        {/* Reward & CTA */}
        <div className="oui-flex oui-flex-col oui-items-end oui-gap-2 oui-flex-shrink-0">
          <div className="oui-text-right">
            <p className="oui-text-lg oui-font-bold oui-text-[#00E676]">+{quest.reward.amount}</p>
            <p className="oui-text-xs oui-text-base-contrast-54">{quest.reward.token} • {quest.reward.xp} XP</p>
          </div>

          {isClaimable ? (
            <button className="oui-px-4 oui-py-2 oui-text-sm oui-font-semibold oui-text-white oui-bg-[#00E676] hover:oui-bg-[#00C853] oui-rounded-lg oui-transition-all oui-flex oui-items-center oui-gap-1">
              <Gift className="oui-w-4 oui-h-4" />
              Claim
            </button>
          ) : quest.status === 'available' ? (
            <Link
              to={quest.category === 'trading' ? '/perp/PERP_BTC_USDC' : '#'}
              className="oui-px-4 oui-py-2 oui-text-sm oui-font-semibold oui-text-white oui-rounded-lg oui-transition-all oui-flex oui-items-center oui-gap-1"
              style={{ backgroundColor: quest.iconColor }}
            >
              Start
              <ArrowRight className="oui-w-4 oui-h-4" />
            </Link>
          ) : (
            <span className="oui-px-4 oui-py-2 oui-text-sm oui-font-medium oui-text-base-contrast-54 oui-bg-base-7 oui-rounded-lg">
              {Math.round(progressPercent)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT: Campaign Card
// ============================================================================

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const isCompetition = campaign.type === 'trading_competition';
  const color = isCompetition ? '#FF9800' : '#9C27B0';

  const statusConfig: Record<CampaignStatus, { label: string; color: string }> = {
    upcoming: { label: 'UPCOMING', color: '#2196F3' },
    active: { label: 'LIVE', color: '#00E676' },
    ending_soon: { label: 'ENDING SOON', color: '#FF9800' },
    ended: { label: 'ENDED', color: '#9E9E9E' },
  };

  const status = statusConfig[campaign.status];

  return (
    <div
      className="oui-bg-base-8 oui-border oui-border-line oui-rounded-xl oui-overflow-hidden hover:oui-shadow-lg oui-transition-all"
      style={{ borderColor: `${color}30` }}
    >
      {/* Header */}
      <div
        className="oui-p-4 oui-relative"
        style={{ background: `linear-gradient(135deg, ${color}15, transparent)` }}
      >
        <div className="oui-flex oui-items-center oui-justify-between oui-mb-3">
          <div className="oui-flex oui-items-center oui-gap-2">
            <span
              className="oui-px-2 oui-py-0.5 oui-text-xs oui-font-bold oui-rounded oui-flex oui-items-center oui-gap-1"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {isCompetition ? <Trophy className="oui-w-3 oui-h-3" /> : <Sparkles className="oui-w-3 oui-h-3" />}
              {isCompetition ? 'Competition' : 'New Listing'}
            </span>
            <span
              className="oui-px-2 oui-py-0.5 oui-text-xs oui-font-bold oui-rounded"
              style={{ backgroundColor: `${status.color}20`, color: status.color }}
            >
              {status.label}
            </span>
          </div>
          {campaign.tokenLogo && (
            <img src={campaign.tokenLogo} alt={campaign.tokenSymbol} className="oui-w-8 oui-h-8 oui-rounded-full" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          )}
        </div>

        <h3 className="oui-text-lg oui-font-semibold oui-text-white oui-mb-1">{campaign.title}</h3>
        <p className="oui-text-sm oui-text-base-contrast-54 oui-line-clamp-2">{campaign.description}</p>
      </div>

      {/* Fee Discount */}
      {campaign.feeDiscount && (
        <div className="oui-px-4 oui-py-2 oui-bg-[#00E676]/10 oui-border-y oui-border-[#00E676]/20">
          <div className="oui-flex oui-items-center oui-gap-2 oui-text-sm">
            <Percent className="oui-w-4 oui-h-4 oui-text-[#00E676]" />
            <span className="oui-font-semibold oui-text-[#00E676]">
              {campaign.feeDiscount.maker === 100 ? '0%' : `${100 - campaign.feeDiscount.maker}%`} Maker
            </span>
            <span className="oui-text-base-contrast-36">•</span>
            <span className="oui-font-semibold oui-text-[#00E676]">
              {campaign.feeDiscount.taker}% Off Taker
            </span>
          </div>
        </div>
      )}

      {/* Stats & Leaderboard */}
      <div className="oui-p-4">
        <div className="oui-flex oui-items-center oui-justify-between oui-mb-4">
          <div>
            <p className="oui-text-xs oui-text-base-contrast-54">Prize Pool</p>
            <p className="oui-text-xl oui-font-bold" style={{ color }}>
              {formatNumber(campaign.prizePool.amount)} {campaign.prizePool.token}
            </p>
          </div>
          <div className="oui-text-right">
            <p className="oui-text-xs oui-text-base-contrast-54">Participants</p>
            <p className="oui-text-xl oui-font-bold oui-text-white">{formatNumber(campaign.participants)}</p>
          </div>
        </div>

        {/* Mini Leaderboard */}
        {campaign.leaderboard.length > 0 && (
          <div className="oui-mb-4">
            <p className="oui-text-xs oui-text-base-contrast-54 oui-mb-2">Top 3</p>
            <div className="oui-space-y-1">
              {campaign.leaderboard.map((entry) => (
                <div key={entry.rank} className="oui-flex oui-items-center oui-gap-2 oui-text-sm">
                  <span className={cn(
                    "oui-w-5 oui-font-bold oui-text-xs",
                    entry.rank === 1 && "oui-text-[#FFD700]",
                    entry.rank === 2 && "oui-text-[#C0C0C0]",
                    entry.rank === 3 && "oui-text-[#CD7F32]"
                  )}>
                    #{entry.rank}
                  </span>
                  <span className="oui-flex-1 oui-text-white oui-truncate">{entry.name}</span>
                  <span className="oui-font-medium oui-text-[#00E676]">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="oui-flex oui-items-center oui-justify-between oui-text-xs oui-text-base-contrast-54 oui-mb-4">
          <span>{campaign.startDate}</span>
          <div className="oui-flex-1 oui-mx-3 oui-h-1 oui-bg-base-6 oui-rounded-full oui-overflow-hidden">
            <div
              className="oui-h-full oui-rounded-full"
              style={{
                width: campaign.status === 'upcoming' ? '0%' : campaign.status === 'ended' ? '100%' : '50%',
                backgroundColor: color,
              }}
            />
          </div>
          <span>{campaign.endDate}</span>
        </div>

        {/* CTA */}
        <div className="oui-flex oui-gap-2">
          <Link
            to={campaign.tradingPair ? `/perp/${campaign.tradingPair}` : '/perp/PERP_BTC_USDC'}
            className="oui-flex-1 oui-px-4 oui-py-2.5 oui-text-sm oui-font-semibold oui-text-white oui-rounded-lg oui-text-center oui-transition-all hover:oui-opacity-90"
            style={{ backgroundColor: color }}
          >
            {campaign.status === 'upcoming' ? 'Notify Me' : 'Join Campaign'}
          </Link>
          <Link
            to="/leaderboard"
            className="oui-px-4 oui-py-2.5 oui-text-sm oui-font-medium oui-text-base-contrast-54 oui-border oui-border-line oui-rounded-lg hover:oui-bg-base-7 oui-transition-colors"
          >
            Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT: Empty State
// ============================================================================

function EmptyState() {
  return (
    <div className="oui-text-center oui-py-12 oui-bg-base-8 oui-border oui-border-line oui-rounded-xl">
      <CheckCircle className="oui-w-12 oui-h-12 oui-text-[#00E676] oui-mx-auto oui-mb-4" />
      <h3 className="oui-text-lg oui-font-semibold oui-text-white oui-mb-2">All Caught Up!</h3>
      <p className="oui-text-base-contrast-54 oui-mb-4">
        You've completed all available quests. Check back later for more!
      </p>
      <Link
        to="/perp/PERP_BTC_USDC"
        className="oui-inline-flex oui-items-center oui-gap-2 oui-px-4 oui-py-2 oui-text-sm oui-font-medium oui-text-white oui-bg-[#00d4ff] oui-rounded-lg"
      >
        <BarChart3 className="oui-w-4 oui-h-4" />
        Start Trading
      </Link>
    </div>
  );
}
