import { Share, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { copyToClipboard } from "@/lib/utils";
interface ShareButtonsProps {
  url?: string;
}
const ShareButtons = ({
  url
}: ShareButtonsProps) => {
  const {
    toast
  } = useToast();
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
      <Button size="sm" variant="outline" onClick={handleWhatsAppShare} className="bg-green-600 text-white border-green-600 hover:bg-green-700">
        <Share className="w-4 h-4 mr-1" />
        WhatsApp
      </Button>
      
      <Button size="sm" variant="outline" onClick={handleCopyUrl} className="bg-card border-border">
        <Copy className="w-4 h-4 mr-1" />
        Copiar URL
      </Button>
    </div>;
};
export default ShareButtons;