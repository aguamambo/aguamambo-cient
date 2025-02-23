import { AfterViewInit, Component, OnInit } from "@angular/core";
import Chart from "chart.js/auto";

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.css'
})
export class LineChartComponent implements OnInit, AfterViewInit {
  
  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const chart = new Chart(document.getElementById("myChart") as HTMLCanvasElement, {
      type: "line",
      data: {
          labels: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Novembro", "Dezembro"],
          datasets: [
              {
                  label: "clientes",
                  borderColor: "#4A5568",
                  data: [600, 400, 620, 300, 200, 600, 230, 300, 200, 200, 100, 1200],
                  fill: false,
                  pointBackgroundColor: "#4A5568",
                  
                  pointHoverBorderColor: "rgb(74,85,104,0.2)",
              },
          ],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            grid: {
              display: false,
            },
            display: false,
          },
        },
      },
    });
}
}
 



