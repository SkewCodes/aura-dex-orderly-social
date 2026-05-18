"use client"

import { useState, useEffect } from "react" // useEffect 추가
import { Link } from "@remix-run/react"
import { cn } from "../utils"
import { useTranslation } from "@orderly.network/i18n"
import { getSiteConfig } from "../api/site_config"; // getSiteConfig 임포트

// SiteConfig 데이터 타입을 정의합니다. 필요한 필드만 포함할 수 있습니다.
type SiteConfigData = {
  company_name: string;
  business_reg_no: string;
  address: string;
  contact_phone: string;
  contact_email: string; // 이메일 필드 추가 (site_config.ts에 정의된 타입 기준)
} | null;


export default function Footer() {
  const { t } = useTranslation();
  const [siteConfig, setSiteConfig] = useState<SiteConfigData>(null); // 사이트 설정 상태 추가

  // // 컴포넌트 마운트 시 사이트 설정 데이터 가져오기
  // useEffect(() => {
  //   const fetchSiteConfig = async () => {
  //     try {
  //       const config = await getSiteConfig();
  //       if (config.success && config.data) {
  //         setSiteConfig(config.data);
  //       } else {
  //         // API 호출은 성공했으나 데이터가 없는 경우 또는 success가 false인 경우
  //         console.warn("Failed to fetch site config or data is missing.");
  //         setSiteConfig(null); // 명시적으로 null 설정 (선택적)
  //       }
  //     } catch (error) {
  //       console.error("Error fetching site config:", error);
  //       setSiteConfig(null); // 에러 발생 시 null 설정
  //     }
  //   };

  //   fetchSiteConfig();
  // }, []); // 빈 배열을 전달하여 마운트 시 한 번만 실행

  // 데이터 로딩 중이거나 없을 경우 사용할 기본값
  const companyName = siteConfig?.company_name || t('footer.companyNameValue');
  const regNo = siteConfig?.business_reg_no || '583-87-03777'; // 기본값 설정 (기존 하드코딩 값)
  const address = siteConfig?.address || t('footer.addressValue');
  const phone = siteConfig?.contact_phone || '1551-8325'; // 기본값 설정 (기존 하드코딩 값)
  // 이메일은 기존 마크업에 없었으므로, 필요하다면 추가합니다.
  // const email = siteConfig?.contact_email || 'default-email@example.com';
  // 사업자 신고 번호는 site_config에 없으므로 기존 번역 값을 사용합니다.
  const businessReportValue = t('footer.businessReportValue');


  return (
    <footer className="dc-px-16 dc-mt-8 dc-text-xs dc-text-gray-500">

      {/* Mobile version - 새로운 레이아웃 */}
      <div className="md:dc-hidden">
        <hr className="dc-w-full dc-border-t dc-border-[#1F2126] dc-mb-20" />
        {/* Privacy Policy와 Terms of Use 중앙 정렬 */}
        <div className="dc-flex dc-justify-center dc-gap-32 dc-mb-20">
          <Link to="/policy" className="dc-text-13 dc-font-bold dc-text-[#C1C1C1]">{t('footer.privacyPolicy')}</Link>
          <Link to="/terms_of_service" className="dc-text-13 dc-font-bold dc-text-[#C1C1C1]">{t('footer.termsOfUse')}</Link>
        </div>

        {/* Copyright */}
        <div className="dc-mb-8 dc-text-xs dc-text-center dc-text-[#898D99]">
          <p>© 2025 <span className="dc-font-bold dc-text-[#C1C1C1]">Aura</span>. All rights reserved. Powered by Orderly Network.</p>
        </div>
      </div>

      {/* Desktop */}
      <div className="md:dc-block dc-hidden">
        <hr className="dc-w-full dc-border-t dc-border-[#1F2126] dc-mb-20" />
        {/* Privacy Policy and Terms of Use */}
        <div className="dc-flex dc-justify-center dc-gap-32 dc-mb-20">
          <Link to="/policy" className="dc-text-13 dc-font-bold dc-text-[#C1C1C1]">{t('footer.privacyPolicy')}</Link>
          <Link to="/terms_of_service" className="dc-text-13 dc-font-bold dc-text-[#C1C1C1]">{t('footer.termsOfUse')}</Link>
        </div>

        {/* Copyright */}
        <div className="dc-mb-8 dc-text-xs dc-text-center dc-text-[#898D99]">
          <p>© 2025 <span className="dc-font-bold dc-text-[#C1C1C1]">Aura</span>. All rights reserved. Powered by Orderly Network.</p>
        </div>
      </div>
    </footer>
  )
}
