import React from "react";
import TermsItem from "./TermsItem";
import { useLanguage } from "../../hooks/useLanguage";

const CookiePolicy = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center max-w-[1000px] w-full mx-auto pt-28 pb-16 px-4 sm:px-6 md:px-8 text-white">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2">{t('legal.cp.title')}</h1>
      <p className="text-center text-sm sm:text-base mb-8 text-gray-400">{t('legal.cp.date')}</p>
      <main className="space-y-4">
        <TermsItem title={t('legal.cp.s1.title')} information={t('legal.cp.s1.info')} explanation={t('legal.cp.s1.exp')} />
        <TermsItem title={t('legal.cp.s2.title')} information={t('legal.cp.s2.info')} explanation={t('legal.cp.s2.exp')} />
        <TermsItem title={t('legal.cp.s3.title')} information={t('legal.cp.s3.info')} />
        <TermsItem title={t('legal.cp.s4.title')} information={t('legal.cp.s4.info')} explanation={t('legal.cp.s4.exp')} />
        <TermsItem title={t('legal.cp.s5.title')} information={t('legal.cp.s5.info')} />
        <TermsItem title={t('legal.cp.s6.title')} information={t('legal.cp.s6.info')} />
        <TermsItem title={t('legal.cp.s7.title')} information={t('legal.cp.s7.info')} />
        <TermsItem title={t('legal.cp.s8.title')} information={t('legal.cp.s8.info')} />
        <TermsItem title={t('legal.cp.s9.title')} information={t('legal.cp.s9.info')} />
        <TermsItem title={t('legal.cp.s10.title')} information={t('legal.cp.s10.info')} />
        <TermsItem title={t('legal.cp.s11.title')} information={t('legal.cp.s11.info')} />
      </main>
    </div>
  );
};

export default CookiePolicy;
