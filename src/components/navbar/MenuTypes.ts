export interface MenuItem {
  title: string;
  description: string;
  href: string;
  icon: string; // Nome do ícone Lucide (ex: 'Network', 'Wand')
  iconColor?: string; // Classe de cor (text-primary, text-danger, etc)
  target?: string; // _blank para links externos
  badge?: string; // Texto do badge (ex: "NEW")
}

export interface MenuSection {
  id: string;
  title: string;
  icon: string; // Nome do ícone Lucide para a seção
  items: MenuItem[];
}