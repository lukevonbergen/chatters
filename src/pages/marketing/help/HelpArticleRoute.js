import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getArticle } from './articles';

const HelpArticleRoute = () => {
  const { slug } = useParams();
  const article = getArticle(slug);

  // If article doesn't exist, redirect to help guides page
  if (!article) {
    return <Navigate to="/help-new" replace />;
  }

  // Render the article component
  const ArticleComponent = article.component;
  return <ArticleComponent />;
};

export default HelpArticleRoute;
