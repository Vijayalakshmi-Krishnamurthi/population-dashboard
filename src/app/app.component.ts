import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgFor } from '@angular/common';
import { FormControl, FormsModule } from '@angular/forms';
import * as d3 from "d3";
import { GroupeLabales } from "../model/chart.model";

interface Filter {
  value: number;
  viewValue: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit{
  private groupes: GroupeLabales[] = [
    { name: "Asia", color: "#235E98" },
    { name: "Africa", color: "#FDD5A6" },
    { name: "Australia", color: "#8C50A2" },
    { name: "Europe", color: "#6BF279" },
    { name: "North America", color: "#719DA0" },
    { name: "South America", color: "#CECA49" }
  ];

  private svg: any;
  private tooltip: any;
  private margin = { top: 10, right: 30, bottom: 30, left: 60 };
  private width = 1400 - this.margin.left - this.margin.right;
  private height = 400 - this.margin.top - this.margin.bottom;

  title = 'population-dashboard';
  filters: Filter[] = [];
  selected=  new FormControl(2021);
  selectedValue = 2021;
  totalPopulation = "";

  constructor() { }

   ngOnInit(): void {
    this.drawPopulationGrowth();
    this.getFilterValue();
    this.showWorldPopulation(this.selectedValue);
    this.createSvg();
    this.drawPlot(this.selectedValue);
  }

  private async drawPopulationGrowth(){
    let growthData = [];
    const data = await d3.csv("../assets/population.csv");

    const yearArray: number[] = [];
    data.forEach(value => {
      yearArray.push(parseInt(value['Year'] as string));
    })
    const minValue = Math.min(...yearArray);
    const maxValue = Math.max(...yearArray);

    for(let i = minValue; i<=maxValue; i++){
      let totalPopulation = 0;
      data.forEach((value: any) => {
        if(value['Year'] === i.toString()) {
          totalPopulation = totalPopulation + parseInt(value[' Population (000s) '].replace(/\,/g,'') + '000');
        }
      })
      growthData.push({year: i, growth: totalPopulation});
    }

    const heightValue = 150;
    const widthValue = 400;

    // Create SVG
    const svg = d3
      .select('#chart')
      .append('svg')
      .attr('viewBox', `0 0 ${widthValue} ${heightValue}`);
    const strokeWidth = 1.5;
    const margin = { top: 0, bottom: 20, left: 80, right: 20 };
    const chart = svg.append('g').attr('transform', `translate(${margin.left},0)`);
    const width = widthValue - margin.left - margin.right - strokeWidth * 2;
    const height = heightValue - margin.top - margin.bottom;
    const grp = chart
      .append('g')
      .attr('transform', `translate(-${margin.left - strokeWidth},-${margin.top})`);

    // Create scales
    const yScale = d3
      .scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(growthData, (dataPoint) => dataPoint.growth) as number]);
    const xScale = d3
      .scaleLinear()
      .range([0, width])
      .domain(d3.extent(growthData, (dataPoint) => dataPoint.year) as Iterable<d3.NumberValue>);

    const area = d3
      .area()
      .x((dataPoint: any) => xScale(dataPoint.year))
      .y0(height)
      .y1((dataPoint: any) => yScale(dataPoint.growth));

    // Add area
    grp
      .append('path')
      .attr('transform', `translate(${margin.left},0)`)
      .datum(growthData)
      .style('fill', 'lightblue')
      .attr('stroke', 'steelblue')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', strokeWidth)
      .attr('d', area as any);

    // Add the X Axis
    chart
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(10));

    // Add the Y Axis
    chart
      .append('g')
      .attr('transform', `translate(0, 0)`)
      .call(d3.axisLeft(yScale).ticks(3));
  }

  private async getFilterValue(){
    const data = await d3.csv("../assets/population.csv");

    const yearArray: number[] = [];
    data.forEach(value => {
      yearArray.push(parseInt(value['Year'] as string));
    })
    const minValue = Math.min(...yearArray);
    const maxValue = Math.max(...yearArray);

    for(let i = minValue; i<=maxValue; i++){
      this.filters.push({value: i, viewValue: "Year: " + i});
    }
  }

  private getCircleRadius(value: number) {
    if(value > 1000) {
      console.log(value);
    }
    const circleRadius = value < 1000
      ? 5 : (value >= 1000 && value < 5000
        ? 8 : (value >= 5000 && value < 25000
          ? 11 : (value >= 25000 && value < 75000
            ? 14 : (value >= 75000 && value < 100000
              ? 17 : 20))));

    return circleRadius;

  }

  public onFilterChange(year: number) {
    this.showWorldPopulation(year);
    this.drawPlot(year);
  }

  private async showWorldPopulation(year: number) {
    const data = await d3.csv("../assets/population.csv");
    let totalPopulation = 0;
    data.forEach((value: any) => {
      if(value['Year'] === year.toString()) {
        totalPopulation = totalPopulation + parseInt(value[' Population (000s) '].replace(/\,/g,'') + '000');
      }
    })
    this.totalPopulation = this.formatPopulation(totalPopulation);
  }

  private formatPopulation(population: number): string {
    if (population < 1e3) {
      return population.toString();
    }
    if (population >= 1e3 && population < 1e6) {
      return +(population / 1e3).toFixed(1) + "K";
    }
    if (population >= 1e6 && population < 1e9) {
      return +(population / 1e6).toFixed(1) + "M";
    }
    if (population >= 1e9 && population < 1e12) {
      return +(population / 1e9).toFixed(1) + "B";
    }
    if (population >= 1e12) {
      return +(population / 1e12).toFixed(1) + "T";
    }

    return population.toString();
  }

   private createSvg(): void {
    this.svg = d3
      .select("#my_dataviz")
      .append("svg")
      .attr(
        "viewBox",
        `0 0 ${this.width + this.margin.left + this.margin.right} ${this.height +
          this.margin.top +
          this.margin.bottom}`
      )
      .append("g")
      .attr(
        "transform",
        "translate(" + this.margin.left + "," + this.margin.top + ")"
      );
  }

  private async drawPlot(year: number): Promise<void> {
    console.log(year);
    this.selectedValue = year;
    const data = await d3.csv("../assets/population.csv");
    console.log(data);

    const chartData = data.filter((value) => {
      if(value['Year'] === year.toString()) {
        return value;
      }
    })

    document.querySelector('#my_dataviz svg g')!.innerHTML = '';

    this.tooltip = d3.select('body').append("div")
      .classed('chart-tooltip', true)
      .attr("class", 'chart-tooltip')
      .style('display', 'none');

    // Add X axis
    const x = d3
      .scaleLinear()
      .domain([0, 1000])
      .range([0, this.width]);
    this.svg
      .append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    const y = d3
      .scaleLinear()
      .domain([-10, 20])
      .range([this.height, 0]);
    this.svg.append("g").call(d3.axisLeft(y));

    //colors
    const domainScale: string[] = [];
    const rangeColor: string[] = [];
    this.groupes.forEach(element => {
      domainScale.push(element.name);
      rangeColor.push(element.color);
    });

    const color = d3
      .scaleOrdinal()
      .domain(domainScale)
      .range(rangeColor);

    // Add dots
    const dots = this.svg.append("g");
    dots
      .selectAll("dot")
      .data(chartData)
      .enter()
      .append("circle")
      .attr("cx", (d: any) => {
        return x(parseInt(d[' Population_Density ']));
      })
      .attr("cy", (d: any) => {
        return y(parseInt(d[' Population_Growth_Rate ']));
      })
      .attr("r", (d: any) => {
        return this.getCircleRadius(parseInt(d[' Population (000s) '].replace(/\,/g,'')));
      })
      .style("fill", (d: any) => {
        return color(d[' Continent']);
      });

    const circles = this.svg.selectAll("circle");
    circles.on("mouseover", ()=>{
			d3.select('.chart-tooltip').style("display", null)
			})
			.on("mouseout", ()=>{
				d3.select('.chart-tooltip').style("display", "none")
			})
			.on("mousemove", (event: any, d:any)=>{
				d3.select('.chart-tooltip')
					.style("left", event.pageX + 15 + "px")
					.style("top", event.pageY - 25 + "px")
					.html('<div>Country: '+ d['Country'] + '</div><div>Population: ' + d[' Population (000s) ']);

			});
  }
}
