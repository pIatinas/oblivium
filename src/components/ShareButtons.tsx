import whatsappIcon from "@/assets/icons/whatsapp.svg";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { copyToClipboard } from "@/lib/utils";
interface ShareButtonsProps {
  url?: string;
}
const ShareButtons = ({
  url
}: ShareButtonsProps) => {
  const { toast } = useToast();
  const currentUrl = url || window.location.href;
  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(currentUrl)}`;
    window.open(whatsappUrl, '_blank');
  };
  const handleCopyUrl = async () => {
    try {
      await copyToClipboard(currentUrl);
      toast({
        title: "URL copiada!",
        description: "A URL foi copiada para a área de transferência."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar a URL.",
        variant: "destructive"
      });
    }
  };
  return <div className="flex gap-2 mt-2 justify-center ">
      <Button size="sm" variant="outline" onClick={handleWhatsAppShare} className="bg-card border-border">
        <img src={whatsappIcon} alt="Compartilhar no WhatsApp" className="w-4 h-4 text-green-500" style={{filter: 'invert(54%) sepia(98%) saturate(525%) hue-rotate(91deg) brightness(95%) contrast(88%)'}} />
      </Button>
      
      <Button size="sm" variant="outline" onClick={handleCopyUrl} className="bg-card border-border">
        <Copy className="w-4 h-4" />
      </Button>
    </div>;
};
export default ShareButtons;