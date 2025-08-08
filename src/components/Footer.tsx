const Footer = () => {
  return <footer className="bg-card/30 backdrop-blur-sm border-t border-border mt-12">
      <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center flex-wrap ">
        <p className="text-muted-foreground mb-10 lg:mb-0 ">
          A vida é feita de escolhas. E eu escolhi lutar ao lado dos meus amigos.
        </p>
        <p className="text-muted-foreground">
          Criado por <a href="https://www.wallaceerick.com.br" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent/80 transition-colors">Wallace</a>
        </p>
      </div>
    </footer>;
};
export default Footer;