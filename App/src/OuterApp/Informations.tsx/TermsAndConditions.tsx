import React from "react";
import TermsItem from "./TermsItem";
import { useLanguage } from "../../hooks/useLanguage";

const TermsAndConditions = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center max-w-[1000px] w-full mx-auto pt-28 pb-16 px-4 sm:px-6 md:px-8 text-white">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2">{t('legal.tc.title')}</h1>
      <p className="text-center text-sm sm:text-base mb-8 text-gray-400">{t('legal.tc.date')}</p>
      <main className="space-y-4">
        <TermsItem title={t('legal.tc.s1.title')} information={t('legal.tc.s1.info')} explanation={t('legal.tc.s1.exp')} />
        <TermsItem title={t('legal.tc.s2.title')} information={t('legal.tc.s2.info')} />
        <TermsItem title={t('legal.tc.s3.title')} information={t('legal.tc.s3.info')} explanation={t('legal.tc.s3.exp')} />
        <TermsItem title={t('legal.tc.s4.title')} information={t('legal.tc.s4.info')} explanation={t('legal.tc.s4.exp')} />
        <TermsItem title={t('legal.tc.s5.title')} information={t('legal.tc.s5.info')} explanation={t('legal.tc.s5.exp')} />
        <TermsItem title={t('legal.tc.s6.title')} information={t('legal.tc.s6.info')} />
        <TermsItem title={t('legal.tc.s7.title')} information={t('legal.tc.s7.info')} />
        <TermsItem title={t('legal.tc.s8.title')} information={t('legal.tc.s8.info')} />
        <TermsItem title={t('legal.tc.s9.title')} information={t('legal.tc.s9.info')} />
        <TermsItem title={t('legal.tc.s10.title')} information={t('legal.tc.s10.info')} />
        <TermsItem title={t('legal.tc.s11.title')} information={t('legal.tc.s11.info')} />
        <TermsItem title={t('legal.tc.s12.title')} information={t('legal.tc.s12.info')} />
        <TermsItem title={t('legal.tc.s13.title')} information={t('legal.tc.s13.info')} />
      </main>
    </div>
  );
};

export default TermsAndConditions;
