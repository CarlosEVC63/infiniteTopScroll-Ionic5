import { Component, State, h, Element } from '@stencil/core';

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.css'
})
export class appProfile {
  private flag = true;
  private bufferData = [];
  private contentArea = null; //Pointer to <content> tag
  
  @State() data = [];
  @State() loadingData: boolean = false; //Spinner flag
  @Element() el: HTMLElement;

  componentWillLoad() {
    this.pushData(); //Prepare first data chunk
  }

  async componentDidLoad() {
    this.contentArea = this.el.querySelector("ion-content"); //Pointer to <content> tag
    console.log('The flag is: ' + this.flag);
    if (this.flag) {
      setTimeout(() => {this.scrollChat();}, 200); //Scroll to bottom at the very begining
      console.log("Reached bottom");
    }
  }
  async scrollChat() { //Scroll to bottom
    this.contentArea.scrollToBottom(100);
    this.flag = false;
  }

  pushData() { // Load data
    const max = this.data.length + 20;
    const min = max - 20;
    const dataBefore = [];
    for (var i = min; i < max; i++) { //Generate data
      dataBefore.push('Item ' + i);
    }
    dataBefore.reverse(); //Reverse the sequence to provide backwards counting

    if (this.flag) { //No need for the buffer at the first chunk
      this.data = [...dataBefore, ...this.data];
    } else { //If not the very first chunk then put data chunk into buffer
      this.bufferData = [...dataBefore]; 
      console.log('Last element of the buffer is: ' + this.bufferData[0]);
    }
  }

  startLoading() { //This is called if scroll is at 0,0 point
    if (!this.getFlagNoMoreData()) { // If data not exausted yet
      if (this.bufferData.length === 0) { // Replenish the buffer
        this.loadingData = true; // Spinner is ON
        setTimeout(()=> {
          this.pushData(); //Load new buffer chunk
          this.feedLastItem(); //Feed last item after timeOut - VERY IMPORTANT!!
          console.log(`last item in buffer is now: ${this.bufferData[this.bufferData.length - 1]} Length is: ${this.bufferData.length}`);
  
          this.loadingData = false; // Spinner is OFF
        }, 1000);        
      } else {
        this.feedLastItem(); //Just feed last item without timeOut delay - VERY IMPORTANT!!
      }
  
      console.log(`last item in buffer is now: ${this.bufferData[this.bufferData.length - 1]} Length is: ${this.bufferData.length}`);
      console.log("Total number of items in this.data is: " + this.data.length);      
    }
  }
  feedLastItem() { //Take out the last item from the buffer and add it to the beggining of the data
    let firstItem = this.bufferData[this.bufferData.length - 1];
    this.bufferData.pop(); // Delete last item from the buffer
    this.data = [firstItem, ...this.data]; // Add the extracted item to the begining of data array (Here the RENDERING triggers) 
  }

  // App logic to determine if all data is loaded and disable the infinite scroll
  getFlagNoMoreData() :boolean {
    if (this.data.length == 60) { //Max of items
      return true; // TRUE if no more data available
    } else {
      return false
    }
  }
  setTopPoint(ev) {
    let topPoint = ev.detail.scrollTop; //Get the scroll position
    console.log("TopPoint is: "+ topPoint);
    if ( (topPoint === 0) && (!this.getFlagNoMoreData())) { //If point is 0,0 and data is avalaible yet then load more data
      console.log('Y=0 point reached and there is still more data available');
      this.startLoading();
      this.contentArea.scrollToPoint(0, 5, 200) //After loading and display data, bouncs back by 5 points so to allow further scroll
    }
  }

  render() {
    return [    
      <ion-content
        scrollEvents={true}
        onIonScrollStart={() => console.log("Scroll Started")}
        onIonScroll={(ev) => {console.log(ev.detail + "--"+ ev.detail.scrollTop);
          this.setTopPoint(ev);}}
        onIonScrollEnd={() => console.log("Scroll ended")}>

        <ion-spinner hidden={!this.loadingData} name="lines" />
        <ion-list>
          {this.data.map(item =>
            <ion-item id = {item}>
              <ion-label>{item}</ion-label>
            </ion-item>
          )}
        </ion-list>
      </ion-content>
      
    ];
  }
}
