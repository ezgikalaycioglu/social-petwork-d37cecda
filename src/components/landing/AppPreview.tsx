
const AppPreview = () => {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          See the App in 
          <span style={{ color: '#A8DAB5' }}> Action</span>
        </h2>
        <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
          Discover how Social Petwork makes connecting with other pet parents simple and fun
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 items-center justify-center">
          <div className="flex justify-center">
            <img 
              src="/lovable-uploads/5f6310c4-2136-48d2-84a3-11a3c11677d2.png" 
              alt="Pet community profiles and connections"
              className="w-64 h-auto rounded-2xl shadow-lg"
            />
          </div>
          
          <div className="flex justify-center">
            <img 
              src="/lovable-uploads/4c206775-4a71-4b32-a928-56724509f935.png" 
              alt="Walk coordination and messaging"
              className="w-64 h-auto rounded-2xl shadow-lg"
            />
          </div>
          
          <div className="flex justify-center">
            <img 
              src="/lovable-uploads/d9e8b07e-7d6b-4ddb-ae7c-bcf5166c1ce0.png" 
              alt="Location-based pet tracking and walks"
              className="w-64 h-auto rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppPreview;
