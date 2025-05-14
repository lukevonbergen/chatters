const PageContainer = ({ children }) => {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    );
  };
  
  export default PageContainer;