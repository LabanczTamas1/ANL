import React from "react";
import TermsItem from "./TermsItem";
import { useLanguage } from "../../hooks/useLanguage";

const PrivacyPolicy = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center max-w-[1000px] w-full mx-auto pt-28 pb-16 px-4 sm:px-6 md:px-8 text-white">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2">{t('legal.pp.title')}</h1>
      <p className="text-center text-sm sm:text-base mb-8 text-gray-400">{t('legal.pp.date')}</p>
      <main className="space-y-4">
        <TermsItem title={t('legal.pp.s1.title')} information={t('legal.pp.s1.info')} explanation={t('legal.pp.s1.exp')} />
        <TermsItem title={t('legal.pp.s2.title')} information={t('legal.pp.s2.info')} explanation={t('legal.pp.s2.exp')} />
        <TermsItem title={t('legal.pp.s3.title')} information={t('legal.pp.s3.info')} explanation={t('legal.pp.s3.exp')} />
        <TermsItem title={t('legal.pp.s4.title')} information={t('legal.pp.s4.info')} explanation={t('legal.pp.s4.exp')} />
        <TermsItem title={t('legal.pp.s5.title')} information={t('legal.pp.s5.info')} />
        <TermsItem title={t('legal.pp.s6.title')} information={t('legal.pp.s6.info')} />
        <TermsItem title={t('legal.pp.s7.title')} information={t('legal.pp.s7.info')} explanation={t('legal.pp.s7.exp')} />
        <TermsItem title={t('legal.pp.s8.title')} information={t('legal.pp.s8.info')} />
        <TermsItem title={t('legal.pp.s9.title')} information={t('legal.pp.s9.info')} explanation={t('legal.pp.s9.exp')} />
        <TermsItem title={t('legal.pp.s10.title')} information={t('legal.pp.s10.info')} />
        <TermsItem title={t('legal.pp.s11.title')} information={t('legal.pp.s11.info')} />
        <TermsItem title={t('legal.pp.s12.title')} information={t('legal.pp.s12.info')} />
        <TermsItem title={t('legal.pp.s13.title')} information={t('legal.pp.s13.info')} />
      </main>
    </div>
  );
};

export default PrivacyPolicy;
