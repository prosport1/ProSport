export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div 
      className="relative flex min-h-screen flex-col"
      style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)), url('https://storage.googleapis.com/aip-dev-buddy-user-assets/images/de4a9b5f-a0a8-42bd-9c7a-59f77f0a6d1c.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="flex-1">
          {children}
      </div>
      <footer className="w-full bg-card/80 backdrop-blur-sm p-4 text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} Direitos Reservados ProSport
      </footer>
    </div>
  );
}
