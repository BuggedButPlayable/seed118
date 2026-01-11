import { common } from './translations/common';
import { header } from './translations/header';
import { nav } from './translations/nav';
import { home } from './translations/home';
import { blog } from './translations/blog';
import { notFound } from './translations/not-found';
import { termsOfService } from './translations/terms-of-service';
import { privacyPolicy } from './translations/privacy-policy';
import { consent } from './translations/consent';
import { footer } from './translations/footer';
import { imprint } from './translations/imprint';

export const translations = {
    common,
    consent,
    footer,
    header,
    nav,
    home,
    blog,
    imprint,
    termsOfService,
    privacyPolicy,
    notFound,
} as const;
