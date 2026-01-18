export default function ResultPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold">Ergebnis</h1>
      <p className="text-muted-foreground">
        Analyse-ID: {params.id}
      </p>
      <p className="mt-4">
        Ergebnis-Seite wird in Epic 3 implementiert.
      </p>
    </div>
  )
}

