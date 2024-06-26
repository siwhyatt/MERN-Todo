import Helmet from 'react-helmet';

interface SEOProps {
  title: string;
  description: string;
  lang?: string;
}

const SEO = ({ title, description, lang }: SEOProps) => (
  <Helmet>
    {lang && <html lang={lang} />}
    <title>{title}</title>
    <meta name="description" content={description} />
  </Helmet>
);

export default SEO;
