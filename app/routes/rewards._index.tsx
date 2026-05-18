import { useState } from "react";
import { Link } from "@remix-run/react";
import {
  Gift,
  Check,
  Flame,
  Crown,
  Zap,
  TrendingUp,
  Calendar,
  Coins,
  Sparkles,
  PartyPopper,
  Wallet,
  UserPlus,
  BarChart3,
  Clock,
  Lock,
  ChevronRight,
  BadgePercent,
  Percent,
  Shield,
  Box,
  Star,
  Trophy,
  ArrowRight,
  History,
  ExternalLink,
  Copy,
  Users,
  DollarSign,
  Share2,
  Award,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface RewardType {
  id: string;
  name: string;
  icon: any;
  color: string;
  bgGradient: string;
  description: string;
  available: number;
  totalValue: string;
}

interface DailyCheckIn {
  day: number;
  reward: string;
  rewardType: 'xp' | 'token' | 'bonus' | 'mystery';
  claimed: boolean;
  isToday: boolean;
  isLocked: boolean;
}

interface WelcomeGift {
  id: string;
  title: string;
  description: string;
  reward: string;
  rewardValue: string;
  icon: any;
  color: string;
  requirement: string;
  progress: number;
  target: number;
  claimed: boolean;
  expiresIn?: string;
}

interface UserRewards {
  totalPoints: number;
  availableBonuses: number;
  pendingAirdrops: number;
  feeSavers: number;
  streak: number;
  level: number;
  nextLevelProgress: number;
  totalEarned: string;
  claimableValue: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const rewardTypes: RewardType[] = [
  {
    id: 'bonus',
    name: 'Trading Bonus',
    icon: Coins,
    color: '#FFD700',
    bgGradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    description: 'Use as margin for trading',
    available: 3,
    totalValue: '$150',
  },
  {
    id: 'fee-saver',
    name: 'Fee Saver',
    icon: BadgePercent,
    color: '#00E676',
    bgGradient: 'linear-gradient(135deg, #00E676 0%, #00C853 100%)',
    description: 'Reduce trading fees',
    available: 5,
    totalValue: '$45',
  },
  {
    id: 'airdrop',
    name: 'Airdrop',
    icon: PartyPopper,
    color: '#E040FB',
    bgGradient: 'linear-gradient(135deg, #E040FB 0%, #7C4DFF 100%)',
    description: 'Free token rewards',
    available: 2,
    totalValue: '$80',
  },
  {
    id: 'fee-discount',
    name: 'Fee Discount',
    icon: Percent,
    color: '#00BCD4',
    bgGradient: 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)',
    description: 'Percentage off fees',
    available: 1,
    totalValue: '20% off',
  },
  {
    id: 'apy-booster',
    name: 'APY Booster',
    icon: TrendingUp,
    color: '#FF6D00',
    bgGradient: 'linear-gradient(135deg, #FF6D00 0%, #FF3D00 100%)',
    description: 'Boost staking rewards',
    available: 0,
    totalValue: '-',
  },
  {
    id: 'loss-cover',
    name: 'Loss Cover',
    icon: Shield,
    color: '#2196F3',
    bgGradient: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
    description: 'Protection voucher',
    available: 1,
    totalValue: '$50',
  },
];

const dailyCheckIn: DailyCheckIn[] = [
  { day: 1, reward: '10 XP', rewardType: 'xp', claimed: true, isToday: false, isLocked: false },
  { day: 2, reward: '20 XP', rewardType: 'xp', claimed: true, isToday: false, isLocked: false },
  { day: 3, reward: '5 AURA', rewardType: 'token', claimed: true, isToday: false, isLocked: false },
  { day: 4, reward: '30 XP', rewardType: 'xp', claimed: true, isToday: false, isLocked: false },
  { day: 5, reward: '50 XP', rewardType: 'xp', claimed: false, isToday: true, isLocked: false },
  { day: 6, reward: '$5 Bonus', rewardType: 'bonus', claimed: false, isToday: false, isLocked: true },
  { day: 7, reward: '🎁 Mystery', rewardType: 'mystery', claimed: false, isToday: false, isLocked: true },
];

const welcomeGifts: WelcomeGift[] = [
  {
    id: 'wg-1',
    title: 'First Trade Bonus',
    description: 'Complete your first trade on Aura',
    reward: '$20 Trading Bonus',
    rewardValue: '$20',
    icon: BarChart3,
    color: '#FFD700',
    requirement: 'Execute 1 trade',
    progress: 0,
    target: 1,
    claimed: false,
    expiresIn: '6d 23h',
  },
  {
    id: 'wg-2',
    title: 'Volume Milestone',
    description: 'Trade $1,000 in total volume',
    reward: '$50 Trading Bonus',
    rewardValue: '$50',
    icon: TrendingUp,
    color: '#00E676',
    requirement: 'Trade $1,000 volume',
    progress: 750,
    target: 1000,
    claimed: false,
    expiresIn: '6d 23h',
  },
  {
    id: 'wg-3',
    title: 'Deposit Reward',
    description: 'Make your first deposit',
    reward: '0% Trading Fees (7 days)',
    rewardValue: '7 days',
    icon: Wallet,
    color: '#2196F3',
    requirement: 'Deposit any amount',
    progress: 1,
    target: 1,
    claimed: true,
  },
  {
    id: 'wg-4',
    title: 'Referral Kickstart',
    description: 'Invite your first friend',
    reward: '$30 for you & friend',
    rewardValue: '$30',
    icon: UserPlus,
    color: '#E040FB',
    requirement: 'Refer 1 active user',
    progress: 0,
    target: 1,
    claimed: false,
  },
];

const userRewards: UserRewards = {
  totalPoints: 12500,
  availableBonuses: 3,
  pendingAirdrops: 2,
  feeSavers: 5,
  streak: 5,
  level: 42,
  nextLevelProgress: 85,
  totalEarned: '$1,245',
  claimableValue: '$325',
};

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

export default function RewardsHub() {
  return (
    <div className="oui-min-h-screen oui-bg-[#0a0e17]">
      {/* ======================================================================
          HERO SECTION
      ====================================================================== */}
      <div className="oui-relative oui-overflow-hidden">
        {/* Animated Background */}
        <div className="oui-absolute oui-inset-0">
          <div className="oui-absolute oui-inset-0 oui-bg-gradient-to-br oui-from-[#00d4ff]/10 oui-via-transparent oui-to-[#7b61ff]/10" />
          <div className="oui-absolute oui-top-0 oui-right-0 oui-w-[600px] oui-h-[600px] oui-bg-[#00d4ff]/5 oui-rounded-full oui-blur-[100px]" />
          <div className="oui-absolute oui-bottom-0 oui-left-0 oui-w-[400px] oui-h-[400px] oui-bg-[#7b61ff]/5 oui-rounded-full oui-blur-[80px]" />
        </div>

        <div className="oui-relative oui-max-w-[1280px] oui-mx-auto oui-px-4 lg:oui-px-6 oui-pt-8 oui-pb-6">
          {/* Header */}
          <div className="oui-flex oui-items-start oui-justify-between oui-mb-8 oui-flex-wrap oui-gap-6">
            <div>
              <h1 className="oui-text-3xl lg:oui-text-4xl oui-font-bold oui-text-white oui-mb-2">
                Rewards Hub
              </h1>
              <p className="oui-text-base-contrast-54 oui-text-lg">
                Your one-stop portal for benefits and rewards
              </p>
            </div>

            {/* Quick Stats */}
            <div className="oui-flex oui-items-center oui-gap-3 oui-flex-wrap">
              <div className="oui-flex oui-items-center oui-gap-2 oui-px-4 oui-py-2.5 oui-bg-base-8/80 oui-backdrop-blur oui-rounded-xl oui-border oui-border-line">
                <Coins className="oui-w-5 oui-h-5 oui-text-[#FFD700]" />
                <div>
                  <p className="oui-text-xs oui-text-base-contrast-54">Total Points</p>
                  <p className="oui-font-bold oui-text-white">{formatNumber(userRewards.totalPoints)}</p>
                </div>
              </div>
              <div className="oui-flex oui-items-center oui-gap-2 oui-px-4 oui-py-2.5 oui-bg-base-8/80 oui-backdrop-blur oui-rounded-xl oui-border oui-border-line">
                <Flame className="oui-w-5 oui-h-5 oui-text-[#FF9800]" />
                <div>
                  <p className="oui-text-xs oui-text-base-contrast-54">Streak</p>
                  <p className="oui-font-bold oui-text-white">{userRewards.streak} Days</p>
                </div>
              </div>
              <div className="oui-flex oui-items-center oui-gap-2 oui-px-4 oui-py-2.5 oui-bg-base-8/80 oui-backdrop-blur oui-rounded-xl oui-border oui-border-line">
                <Crown className="oui-w-5 oui-h-5 oui-text-[#E040FB]" />
                <div>
                  <p className="oui-text-xs oui-text-base-contrast-54">Level</p>
                  <p className="oui-font-bold oui-text-white">{userRewards.level}</p>
                </div>
              </div>
              <div className="oui-flex oui-items-center oui-gap-2 oui-px-4 oui-py-2.5 oui-bg-[#00E676]/10 oui-backdrop-blur oui-rounded-xl oui-border oui-border-[#00E676]/30">
                <Gift className="oui-w-5 oui-h-5 oui-text-[#00E676]" />
                <div>
                  <p className="oui-text-xs oui-text-[#00E676]">Claimable</p>
                  <p className="oui-font-bold oui-text-[#00E676]">{userRewards.claimableValue}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Check-in Card */}
          <DailyCheckInCard checkInData={dailyCheckIn} streak={userRewards.streak} />
        </div>
      </div>

      {/* ======================================================================
          REWARD TYPES GRID
      ====================================================================== */}
      <div className="oui-max-w-[1280px] oui-mx-auto oui-px-4 lg:oui-px-6 oui-py-8">
        <div className="oui-flex oui-items-center oui-justify-between oui-mb-6">
          <h2 className="oui-text-xl oui-font-semibold oui-text-white oui-flex oui-items-center oui-gap-2">
            <Gift className="oui-w-5 oui-h-5 oui-text-[#00d4ff]" />
            My Rewards
          </h2>
          <Link to="/rewards/history" className="oui-text-sm oui-text-[#00d4ff] hover:oui-underline oui-flex oui-items-center oui-gap-1">
            <History className="oui-w-4 oui-h-4" />
            View History
          </Link>
        </div>

        <div className="oui-grid oui-grid-cols-2 md:oui-grid-cols-3 lg:oui-grid-cols-6 oui-gap-4">
          {rewardTypes.map((reward) => (
            <RewardTypeCard key={reward.id} reward={reward} />
          ))}
        </div>
      </div>

      {/* ======================================================================
          NEW USER WELCOME GIFTS
      ====================================================================== */}
      <div className="oui-max-w-[1280px] oui-mx-auto oui-px-4 lg:oui-px-6 oui-py-8">
        <div className="oui-bg-gradient-to-r oui-from-[#FFD700]/10 oui-via-[#FF9800]/5 oui-to-transparent oui-border oui-border-[#FFD700]/20 oui-rounded-2xl oui-p-6">
          <div className="oui-flex oui-items-center oui-justify-between oui-mb-6">
            <div className="oui-flex oui-items-center oui-gap-3">
              <div className="oui-w-12 oui-h-12 oui-rounded-xl oui-bg-gradient-to-br oui-from-[#FFD700] oui-to-[#FF9800] oui-flex oui-items-center oui-justify-center">
                <PartyPopper className="oui-w-6 oui-h-6 oui-text-white" />
              </div>
              <div>
                <h2 className="oui-text-xl oui-font-semibold oui-text-white">Welcome Gifts</h2>
                <p className="oui-text-sm oui-text-base-contrast-54">Claim up to $100+ in rewards</p>
              </div>
            </div>
            <div className="oui-text-right oui-hidden sm:oui-block">
              <p className="oui-text-sm oui-text-base-contrast-54">Progress</p>
              <p className="oui-text-lg oui-font-semibold oui-text-[#FFD700]">2/4 Claimed</p>
            </div>
          </div>

          <div className="oui-grid md:oui-grid-cols-2 lg:oui-grid-cols-4 oui-gap-4">
            {welcomeGifts.map((gift) => (
              <WelcomeGiftCard key={gift.id} gift={gift} />
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================================
          LUCKY DRAW BANNER
      ====================================================================== */}
      <div className="oui-max-w-[1280px] oui-mx-auto oui-px-4 lg:oui-px-6 oui-py-8">
        <div className="oui-relative oui-overflow-hidden oui-rounded-2xl oui-border oui-border-[#E040FB]/30">
          <div className="oui-absolute oui-inset-0 oui-bg-gradient-to-r oui-from-[#E040FB]/20 oui-via-[#7C4DFF]/10 oui-to-[#00d4ff]/20" />
          <div className="oui-absolute oui-top-0 oui-right-0 oui-w-64 oui-h-64 oui-bg-[#E040FB]/10 oui-rounded-full oui-blur-[60px]" />
          
          <div className="oui-relative oui-p-8 oui-flex oui-items-center oui-justify-between oui-flex-wrap oui-gap-6">
            <div className="oui-flex oui-items-center oui-gap-4">
              <div className="oui-w-16 oui-h-16 oui-rounded-2xl oui-bg-gradient-to-br oui-from-[#E040FB] oui-to-[#7C4DFF] oui-flex oui-items-center oui-justify-center oui-animate-pulse">
                <Box className="oui-w-8 oui-h-8 oui-text-white" />
              </div>
              <div>
                <h3 className="oui-text-2xl oui-font-bold oui-text-white oui-mb-1">Lucky Draw</h3>
                <p className="oui-text-base-contrast-54">Spin daily for a chance to win up to $1,000!</p>
              </div>
            </div>
            <div className="oui-flex oui-items-center oui-gap-6">
              <div className="oui-text-center">
                <p className="oui-text-sm oui-text-base-contrast-54">Spins Available</p>
                <p className="oui-text-3xl oui-font-bold oui-text-[#E040FB]">3</p>
              </div>
              <button className="oui-px-8 oui-py-3 oui-text-base oui-font-semibold oui-text-white oui-bg-gradient-to-r oui-from-[#E040FB] oui-to-[#7C4DFF] oui-rounded-xl hover:oui-opacity-90 oui-transition-all oui-shadow-lg oui-shadow-[#E040FB]/25">
                Spin Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================================
          QUICK LINKS
      ====================================================================== */}
      <div className="oui-max-w-[1280px] oui-mx-auto oui-px-4 lg:oui-px-6 oui-py-8">
        <div className="oui-grid md:oui-grid-cols-3 oui-gap-4">
          <Link
            to="/social"
            className="oui-group oui-bg-base-8 oui-border oui-border-line oui-rounded-xl oui-p-5 hover:oui-border-[#00d4ff]/50 oui-transition-all"
          >
            <div className="oui-flex oui-items-center oui-justify-between">
              <div className="oui-flex oui-items-center oui-gap-3">
                <div className="oui-w-10 oui-h-10 oui-rounded-lg oui-bg-[#00d4ff]/10 oui-flex oui-items-center oui-justify-center">
                  <Zap className="oui-w-5 oui-h-5 oui-text-[#00d4ff]" />
                </div>
                <div>
                  <h3 className="oui-font-semibold oui-text-white">Quests & Campaigns</h3>
                  <p className="oui-text-sm oui-text-base-contrast-54">Earn rewards by completing tasks</p>
                </div>
              </div>
              <ArrowRight className="oui-w-5 oui-h-5 oui-text-base-contrast-54 group-hover:oui-text-[#00d4ff] oui-transition-colors" />
            </div>
          </Link>

          <Link
            to="/leaderboard"
            className="oui-group oui-bg-base-8 oui-border oui-border-line oui-rounded-xl oui-p-5 hover:oui-border-[#FF9800]/50 oui-transition-all"
          >
            <div className="oui-flex oui-items-center oui-justify-between">
              <div className="oui-flex oui-items-center oui-gap-3">
                <div className="oui-w-10 oui-h-10 oui-rounded-lg oui-bg-[#FF9800]/10 oui-flex oui-items-center oui-justify-center">
                  <Trophy className="oui-w-5 oui-h-5 oui-text-[#FF9800]" />
                </div>
                <div>
                  <h3 className="oui-font-semibold oui-text-white">Leaderboards</h3>
                  <p className="oui-text-sm oui-text-base-contrast-54">View rankings and competitions</p>
                </div>
              </div>
              <ArrowRight className="oui-w-5 oui-h-5 oui-text-base-contrast-54 group-hover:oui-text-[#FF9800] oui-transition-colors" />
            </div>
          </Link>

          <Link
            to="/portfolio/affiliate"
            className="oui-group oui-bg-base-8 oui-border oui-border-line oui-rounded-xl oui-p-5 hover:oui-border-[#E040FB]/50 oui-transition-all"
          >
            <div className="oui-flex oui-items-center oui-justify-between">
              <div className="oui-flex oui-items-center oui-gap-3">
                <div className="oui-w-10 oui-h-10 oui-rounded-lg oui-bg-[#E040FB]/10 oui-flex oui-items-center oui-justify-center">
                  <UserPlus className="oui-w-5 oui-h-5 oui-text-[#E040FB]" />
                </div>
                <div>
                  <h3 className="oui-font-semibold oui-text-white">Referral Program</h3>
                  <p className="oui-text-sm oui-text-base-contrast-54">Earn 30% commission on referrals</p>
                </div>
              </div>
              <ArrowRight className="oui-w-5 oui-h-5 oui-text-base-contrast-54 group-hover:oui-text-[#E040FB] oui-transition-colors" />
            </div>
          </Link>
        </div>
      </div>

      {/* ======================================================================
          REWARD STATS SUMMARY
      ====================================================================== */}
      <div className="oui-max-w-[1280px] oui-mx-auto oui-px-4 lg:oui-px-6 oui-py-8">
        <div className="oui-bg-base-8 oui-border oui-border-line oui-rounded-xl oui-p-6">
          <h3 className="oui-text-lg oui-font-semibold oui-text-white oui-mb-6 oui-flex oui-items-center oui-gap-2">
            <Star className="oui-w-5 oui-h-5 oui-text-[#FFD700]" />
            Your Reward Summary
          </h3>
          <div className="oui-grid oui-grid-cols-2 md:oui-grid-cols-4 oui-gap-6">
            <div className="oui-text-center">
              <p className="oui-text-3xl oui-font-bold oui-text-white">{userRewards.totalEarned}</p>
              <p className="oui-text-sm oui-text-base-contrast-54">Total Earned</p>
            </div>
            <div className="oui-text-center">
              <p className="oui-text-3xl oui-font-bold oui-text-[#00E676]">{userRewards.claimableValue}</p>
              <p className="oui-text-sm oui-text-base-contrast-54">Claimable Now</p>
            </div>
            <div className="oui-text-center">
              <p className="oui-text-3xl oui-font-bold oui-text-[#E040FB]">{userRewards.pendingAirdrops}</p>
              <p className="oui-text-sm oui-text-base-contrast-54">Pending Airdrops</p>
            </div>
            <div className="oui-text-center">
              <p className="oui-text-3xl oui-font-bold oui-text-[#FFD700]">{formatNumber(userRewards.totalPoints)}</p>
              <p className="oui-text-sm oui-text-base-contrast-54">Reward Points</p>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================================
          AFFILIATES WIDGET - Refer & Earn
      ====================================================================== */}
      <div className="oui-max-w-[1280px] oui-mx-auto oui-px-4 lg:oui-px-6 oui-py-8 oui-pb-16">
        <AffiliatesWidget />
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT: Affiliates Widget
// ============================================================================

function AffiliatesWidget() {
  const [copied, setCopied] = useState(false);
  const referralCode = "AURA-X7K9M2";
  const referralLink = `https://aura.trade/ref/${referralCode}`;

  const affiliateStats = {
    totalReferrals: 23,
    activeTraders: 18,
    totalEarnings: 1245.50,
    pendingRewards: 89.25,
    commissionRate: 30,
    tier: 'Silver',
    nextTier: 'Gold',
    nextTierRequirement: 50,
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="oui-bg-gradient-to-br oui-from-[#00d4ff]/10 oui-via-base-8 oui-to-[#7b61ff]/10 oui-border oui-border-[#00d4ff]/30 oui-rounded-2xl oui-overflow-hidden">
      {/* Header */}
      <div className="oui-p-6 oui-border-b oui-border-line">
        <div className="oui-flex oui-items-center oui-justify-between oui-flex-wrap oui-gap-4">
          <div className="oui-flex oui-items-center oui-gap-4">
            <div className="oui-w-14 oui-h-14 oui-rounded-2xl oui-bg-gradient-to-br oui-from-[#00d4ff] oui-to-[#7b61ff] oui-flex oui-items-center oui-justify-center">
              <UserPlus className="oui-w-7 oui-h-7 oui-text-white" />
            </div>
            <div>
              <h2 className="oui-text-xl oui-font-bold oui-text-white oui-mb-1">Affiliate Program</h2>
              <p className="oui-text-base-contrast-54">Refer traders and earn up to <span className="oui-text-[#00E676] oui-font-semibold">{affiliateStats.commissionRate}%</span> commission</p>
            </div>
          </div>
          
          {/* Tier Badge */}
          <div className="oui-flex oui-items-center oui-gap-3">
            <div className="oui-text-right oui-hidden sm:oui-block">
              <p className="oui-text-xs oui-text-base-contrast-54">Current Tier</p>
              <p className="oui-text-lg oui-font-bold oui-text-[#C0C0C0]">{affiliateStats.tier}</p>
            </div>
            <div className="oui-w-12 oui-h-12 oui-rounded-xl oui-bg-[#C0C0C0]/20 oui-flex oui-items-center oui-justify-center">
              <Award className="oui-w-6 oui-h-6 oui-text-[#C0C0C0]" />
            </div>
          </div>
        </div>
      </div>

      <div className="oui-p-6">
        {/* Referral Link Section */}
        <div className="oui-mb-6">
          <label className="oui-text-sm oui-text-base-contrast-54 oui-mb-2 oui-block">Your Referral Link</label>
          <div className="oui-flex oui-gap-2">
            <div className="oui-flex-1 oui-bg-base-7 oui-border oui-border-line oui-rounded-xl oui-px-4 oui-py-3 oui-flex oui-items-center oui-justify-between">
              <span className="oui-text-white oui-font-mono oui-text-sm oui-truncate">{referralLink}</span>
              <button
                onClick={() => handleCopy(referralLink)}
                className="oui-ml-3 oui-p-2 oui-rounded-lg oui-bg-base-6 hover:oui-bg-base-5 oui-transition-colors"
              >
                {copied ? (
                  <Check className="oui-w-4 oui-h-4 oui-text-[#00E676]" />
                ) : (
                  <Copy className="oui-w-4 oui-h-4 oui-text-base-contrast-54" />
                )}
              </button>
            </div>
            <button
              onClick={() => handleCopy(referralCode)}
              className="oui-px-4 oui-py-3 oui-bg-base-7 oui-border oui-border-line oui-rounded-xl oui-text-sm oui-font-semibold oui-text-white hover:oui-bg-base-6 oui-transition-colors oui-flex oui-items-center oui-gap-2"
            >
              <span className="oui-text-[#00d4ff]">{referralCode}</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="oui-grid oui-grid-cols-2 lg:oui-grid-cols-4 oui-gap-4 oui-mb-6">
          <div className="oui-bg-base-7/50 oui-border oui-border-line oui-rounded-xl oui-p-4">
            <div className="oui-flex oui-items-center oui-gap-2 oui-mb-2">
              <Users className="oui-w-4 oui-h-4 oui-text-[#00d4ff]" />
              <span className="oui-text-xs oui-text-base-contrast-54">Total Referrals</span>
            </div>
            <p className="oui-text-2xl oui-font-bold oui-text-white">{affiliateStats.totalReferrals}</p>
            <p className="oui-text-xs oui-text-[#00E676]">{affiliateStats.activeTraders} active</p>
          </div>

          <div className="oui-bg-base-7/50 oui-border oui-border-line oui-rounded-xl oui-p-4">
            <div className="oui-flex oui-items-center oui-gap-2 oui-mb-2">
              <DollarSign className="oui-w-4 oui-h-4 oui-text-[#00E676]" />
              <span className="oui-text-xs oui-text-base-contrast-54">Total Earned</span>
            </div>
            <p className="oui-text-2xl oui-font-bold oui-text-[#00E676]">${affiliateStats.totalEarnings.toLocaleString()}</p>
            <p className="oui-text-xs oui-text-base-contrast-54">Lifetime</p>
          </div>

          <div className="oui-bg-base-7/50 oui-border oui-border-line oui-rounded-xl oui-p-4">
            <div className="oui-flex oui-items-center oui-gap-2 oui-mb-2">
              <Clock className="oui-w-4 oui-h-4 oui-text-[#FF9800]" />
              <span className="oui-text-xs oui-text-base-contrast-54">Pending</span>
            </div>
            <p className="oui-text-2xl oui-font-bold oui-text-[#FF9800]">${affiliateStats.pendingRewards.toFixed(2)}</p>
            <p className="oui-text-xs oui-text-base-contrast-54">To be claimed</p>
          </div>

          <div className="oui-bg-base-7/50 oui-border oui-border-line oui-rounded-xl oui-p-4">
            <div className="oui-flex oui-items-center oui-gap-2 oui-mb-2">
              <Percent className="oui-w-4 oui-h-4 oui-text-[#E040FB]" />
              <span className="oui-text-xs oui-text-base-contrast-54">Commission</span>
            </div>
            <p className="oui-text-2xl oui-font-bold oui-text-[#E040FB]">{affiliateStats.commissionRate}%</p>
            <p className="oui-text-xs oui-text-base-contrast-54">Of trading fees</p>
          </div>
        </div>

        {/* Tier Progress */}
        <div className="oui-bg-base-7/50 oui-border oui-border-line oui-rounded-xl oui-p-4 oui-mb-6">
          <div className="oui-flex oui-items-center oui-justify-between oui-mb-3">
            <div className="oui-flex oui-items-center oui-gap-2">
              <TrendingUp className="oui-w-4 oui-h-4 oui-text-[#FFD700]" />
              <span className="oui-text-sm oui-font-medium oui-text-white">Progress to {affiliateStats.nextTier}</span>
            </div>
            <span className="oui-text-sm oui-text-base-contrast-54">
              {affiliateStats.totalReferrals} / {affiliateStats.nextTierRequirement} referrals
            </span>
          </div>
          <div className="oui-h-2 oui-bg-base-6 oui-rounded-full oui-overflow-hidden">
            <div
              className="oui-h-full oui-bg-gradient-to-r oui-from-[#C0C0C0] oui-to-[#FFD700] oui-rounded-full oui-transition-all"
              style={{ width: `${(affiliateStats.totalReferrals / affiliateStats.nextTierRequirement) * 100}%` }}
            />
          </div>
          <p className="oui-text-xs oui-text-base-contrast-54 oui-mt-2">
            Reach {affiliateStats.nextTier} tier to earn <span className="oui-text-[#FFD700] oui-font-semibold">40% commission</span>
          </p>
        </div>

        {/* Commission Tiers */}
        <div className="oui-mb-6">
          <h4 className="oui-text-sm oui-font-semibold oui-text-white oui-mb-3">Commission Tiers</h4>
          <div className="oui-grid oui-grid-cols-4 oui-gap-2">
            {[
              { name: 'Bronze', rate: '20%', req: '0', color: '#CD7F32', active: false },
              { name: 'Silver', rate: '30%', req: '10', color: '#C0C0C0', active: true },
              { name: 'Gold', rate: '40%', req: '50', color: '#FFD700', active: false },
              { name: 'Diamond', rate: '50%', req: '200', color: '#00d4ff', active: false },
            ].map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  "oui-p-3 oui-rounded-xl oui-text-center oui-border oui-transition-all",
                  tier.active
                    ? "oui-bg-base-7 oui-border-2"
                    : "oui-bg-base-8/50 oui-border-line oui-opacity-60"
                )}
                style={tier.active ? { borderColor: tier.color } : {}}
              >
                <div
                  className="oui-w-8 oui-h-8 oui-rounded-lg oui-mx-auto oui-mb-2 oui-flex oui-items-center oui-justify-center"
                  style={{ backgroundColor: `${tier.color}20` }}
                >
                  <Award className="oui-w-4 oui-h-4" style={{ color: tier.color }} />
                </div>
                <p className="oui-text-xs oui-font-semibold oui-text-white">{tier.name}</p>
                <p className="oui-text-lg oui-font-bold" style={{ color: tier.color }}>{tier.rate}</p>
                <p className="oui-text-[10px] oui-text-base-contrast-54">{tier.req}+ refs</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="oui-flex oui-gap-3 oui-flex-wrap">
          <button className="oui-flex-1 oui-px-6 oui-py-3 oui-text-sm oui-font-semibold oui-text-white oui-bg-gradient-to-r oui-from-[#00d4ff] oui-to-[#7b61ff] oui-rounded-xl hover:oui-opacity-90 oui-transition-all oui-flex oui-items-center oui-justify-center oui-gap-2">
            <Share2 className="oui-w-4 oui-h-4" />
            Share Referral Link
          </button>
          <button className="oui-px-6 oui-py-3 oui-text-sm oui-font-semibold oui-text-[#00E676] oui-bg-[#00E676]/10 oui-border oui-border-[#00E676]/30 oui-rounded-xl hover:oui-bg-[#00E676]/20 oui-transition-all oui-flex oui-items-center oui-gap-2">
            <DollarSign className="oui-w-4 oui-h-4" />
            Claim ${affiliateStats.pendingRewards.toFixed(2)}
          </button>
          <Link
            to="/portfolio/affiliate"
            className="oui-px-6 oui-py-3 oui-text-sm oui-font-medium oui-text-base-contrast-54 oui-border oui-border-line oui-rounded-xl hover:oui-bg-base-7 oui-transition-colors oui-flex oui-items-center oui-gap-2"
          >
            View Dashboard
            <ArrowRight className="oui-w-4 oui-h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT: Daily Check-in Card
// ============================================================================

function DailyCheckInCard({ checkInData, streak }: { checkInData: DailyCheckIn[]; streak: number }) {
  return (
    <div className="oui-bg-base-8/80 oui-backdrop-blur oui-border oui-border-line oui-rounded-2xl oui-p-6">
      <div className="oui-flex oui-items-center oui-justify-between oui-mb-6 oui-flex-wrap oui-gap-4">
        <div className="oui-flex oui-items-center oui-gap-3">
          <div className="oui-w-12 oui-h-12 oui-rounded-xl oui-bg-gradient-to-br oui-from-[#FF9800] oui-to-[#FF5722] oui-flex oui-items-center oui-justify-center">
            <Calendar className="oui-w-6 oui-h-6 oui-text-white" />
          </div>
          <div>
            <h3 className="oui-text-lg oui-font-semibold oui-text-white">Daily Check-in</h3>
            <p className="oui-text-sm oui-text-base-contrast-54">
              <Flame className="oui-w-4 oui-h-4 oui-inline oui-text-[#FF9800] oui-mr-1" />
              {streak} day streak! Keep it going for bonus rewards
            </p>
          </div>
        </div>
        <button className="oui-px-6 oui-py-2.5 oui-text-sm oui-font-semibold oui-text-white oui-bg-gradient-to-r oui-from-[#00d4ff] oui-to-[#7b61ff] oui-rounded-xl hover:oui-opacity-90 oui-transition-all oui-shadow-lg oui-shadow-[#00d4ff]/25">
          Check In Today
        </button>
      </div>

      <div className="oui-grid oui-grid-cols-7 oui-gap-2">
        {checkInData.map((day) => (
          <div
            key={day.day}
            className={cn(
              "oui-relative oui-p-3 oui-rounded-xl oui-text-center oui-transition-all",
              day.claimed && "oui-bg-[#00E676]/10 oui-border oui-border-[#00E676]/30",
              day.isToday && !day.claimed && "oui-bg-[#00d4ff]/10 oui-border-2 oui-border-[#00d4ff] oui-shadow-lg oui-shadow-[#00d4ff]/20",
              day.isLocked && "oui-bg-base-7 oui-opacity-50",
              !day.claimed && !day.isToday && !day.isLocked && "oui-bg-base-7 oui-border oui-border-line"
            )}
          >
            <p className="oui-text-xs oui-text-base-contrast-54 oui-mb-1">Day {day.day}</p>
            <div className="oui-text-lg oui-mb-1">
              {day.claimed ? (
                <Check className="oui-w-5 oui-h-5 oui-text-[#00E676] oui-mx-auto" />
              ) : day.isLocked ? (
                <Lock className="oui-w-5 oui-h-5 oui-text-base-contrast-36 oui-mx-auto" />
              ) : day.rewardType === 'mystery' ? (
                <span>🎁</span>
              ) : day.rewardType === 'bonus' ? (
                <span>💰</span>
              ) : day.rewardType === 'token' ? (
                <span>🪙</span>
              ) : (
                <span>⭐</span>
              )}
            </div>
            <p className={cn(
              "oui-text-xs oui-font-medium",
              day.claimed ? "oui-text-[#00E676]" : day.isToday ? "oui-text-[#00d4ff]" : "oui-text-base-contrast-54"
            )}>
              {day.reward}
            </p>
            {day.isToday && (
              <div className="oui-absolute -oui-top-1 -oui-right-1 oui-w-3 oui-h-3 oui-rounded-full oui-bg-[#00d4ff] oui-animate-pulse" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT: Reward Type Card
// ============================================================================

function RewardTypeCard({ reward }: { reward: RewardType }) {
  const RewardIcon = reward.icon;
  const hasRewards = reward.available > 0;

  return (
    <div
      className={cn(
        "oui-relative oui-p-4 oui-rounded-xl oui-border oui-transition-all oui-cursor-pointer hover:oui-scale-[1.02]",
        hasRewards
          ? "oui-bg-base-8 oui-border-line hover:oui-border-opacity-50"
          : "oui-bg-base-8/50 oui-border-line/50 oui-opacity-60"
      )}
      style={hasRewards ? { borderColor: `${reward.color}30` } : {}}
    >
      {hasRewards && reward.available > 0 && (
        <div
          className="oui-absolute -oui-top-2 -oui-right-2 oui-w-6 oui-h-6 oui-rounded-full oui-flex oui-items-center oui-justify-center oui-text-xs oui-font-bold oui-text-white"
          style={{ backgroundColor: reward.color }}
        >
          {reward.available}
        </div>
      )}

      <div
        className="oui-w-10 oui-h-10 oui-rounded-lg oui-flex oui-items-center oui-justify-center oui-mb-3"
        style={{ background: hasRewards ? reward.bgGradient : '#1a1f2e' }}
      >
        <RewardIcon className="oui-w-5 oui-h-5 oui-text-white" />
      </div>

      <h4 className="oui-text-sm oui-font-semibold oui-text-white oui-mb-1">{reward.name}</h4>
      <p className="oui-text-xs oui-text-base-contrast-54 oui-mb-2">{reward.description}</p>

      {hasRewards ? (
        <p className="oui-text-sm oui-font-bold" style={{ color: reward.color }}>{reward.totalValue}</p>
      ) : (
        <p className="oui-text-sm oui-text-base-contrast-36">None available</p>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENT: Welcome Gift Card
// ============================================================================

function WelcomeGiftCard({ gift }: { gift: WelcomeGift }) {
  const GiftIcon = gift.icon;
  const progressPercent = (gift.progress / gift.target) * 100;
  const isComplete = gift.progress >= gift.target;

  return (
    <div
      className={cn(
        "oui-bg-base-8/80 oui-backdrop-blur oui-border oui-rounded-xl oui-p-4 oui-transition-all",
        gift.claimed
          ? "oui-border-[#00E676]/30 oui-opacity-70"
          : isComplete
          ? "oui-border-[#00d4ff] oui-shadow-lg oui-shadow-[#00d4ff]/10"
          : "oui-border-line hover:oui-border-opacity-50"
      )}
    >
      <div className="oui-flex oui-items-start oui-justify-between oui-mb-3">
        <div
          className="oui-w-10 oui-h-10 oui-rounded-lg oui-flex oui-items-center oui-justify-center"
          style={{ backgroundColor: `${gift.color}20` }}
        >
          {gift.claimed ? (
            <Check className="oui-w-5 oui-h-5 oui-text-[#00E676]" />
          ) : (
            <GiftIcon className="oui-w-5 oui-h-5" style={{ color: gift.color }} />
          )}
        </div>
        {gift.expiresIn && !gift.claimed && (
          <span className="oui-text-xs oui-text-base-contrast-54 oui-flex oui-items-center oui-gap-1">
            <Clock className="oui-w-3 oui-h-3" />
            {gift.expiresIn}
          </span>
        )}
      </div>

      <h4 className="oui-text-sm oui-font-semibold oui-text-white oui-mb-1">{gift.title}</h4>
      <p className="oui-text-xs oui-text-base-contrast-54 oui-mb-3">{gift.description}</p>

      {/* Progress */}
      {!gift.claimed && (
        <div className="oui-mb-3">
          <div className="oui-flex oui-items-center oui-justify-between oui-text-xs oui-mb-1">
            <span className="oui-text-base-contrast-54">{gift.requirement}</span>
            <span className="oui-text-white oui-font-medium">
              {formatNumber(gift.progress)}/{formatNumber(gift.target)}
            </span>
          </div>
          <div className="oui-h-1.5 oui-bg-base-6 oui-rounded-full oui-overflow-hidden">
            <div
              className="oui-h-full oui-rounded-full oui-transition-all"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: isComplete ? '#00E676' : gift.color,
              }}
            />
          </div>
        </div>
      )}

      {/* Reward */}
      <div className="oui-flex oui-items-center oui-justify-between">
        <span className="oui-text-sm oui-font-bold" style={{ color: gift.claimed ? '#00E676' : gift.color }}>
          {gift.reward}
        </span>
        {gift.claimed ? (
          <span className="oui-text-xs oui-text-[#00E676] oui-flex oui-items-center oui-gap-1">
            <Check className="oui-w-3 oui-h-3" /> Claimed
          </span>
        ) : isComplete ? (
          <button className="oui-px-3 oui-py-1 oui-text-xs oui-font-semibold oui-text-white oui-bg-[#00E676] oui-rounded-lg">
            Claim
          </button>
        ) : null}
      </div>
    </div>
  );
}
