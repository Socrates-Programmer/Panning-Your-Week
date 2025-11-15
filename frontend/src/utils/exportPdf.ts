import html2pdf from 'html2pdf.js'

export const exportToPDF = () => {
  const element = document.getElementById('planner-root')
  
  if (!element) {
    alert('No se encontró el contenido para exportar')
    return
  }

  const opt = {
    margin: 10,
    filename: `horario-${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'png', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { 
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    },
    pagebreak: { mode: 'avoid-all' },
  }

  html2pdf().set(opt).from(element).save()
}
