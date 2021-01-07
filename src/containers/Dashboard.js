import React, { Component } from "react";
import Etherium from "../assets/etherium.svg";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import EtheriumBox from "../components/EtheriumBox";
import DaiBox from "../components/DaiBox";
import * as ApiHelper from "../lib/ApiHelper";
import * as B from "../lib/bInterface";
import { doApiAction, setUserInfo } from "../lib/Actions";
import EventBus from "../lib/EventBus";
import ModalContainer from "../components/ModalContainer";
import logo from "../assets/logo-maker-black.svg";
import makerStore from "../stores/maker.store"
import userStore from "../stores/user.store";
import {observer} from "mobx-react"


class Dashboard extends Component {
  web3 = null;
  networkType = null;

  constructor(props) {
    super(props);
    this.state = {
      userInfo: null
    };
  }

  onConnect = async (web3, user) => {
    this.web3 = web3;
    this.networkType = await web3.eth.net.getId()
    const userInfo = await makerStore.getUserInfo();
    this.setState({ userInfo })
  };

  onAction = async (action, value, onHash) => {
    try {
      const res = await doApiAction(action, value, null, onHash);
      await makerStore.getUserInfo();
      return res;
    } catch (error) {
      EventBus.$emit("action-failed", null, action);
      let errorMsg = null;
      if(action.toString() === "repay")
          errorMsg = "Repay is expected to fail, likely because your DAI balance is too low (by 0.000001 DAI or less)";
      EventBus.$emit("app-error", errorMsg, action);
      console.log(error);
      return false;
    }
  };

  render() {
    const { userInfo } = this.state;
    const { current, handleItemChange, history } = this.props;
    const { loggedIn, showConnect } = userStore

    return (
      <div className="App">
        <ModalContainer></ModalContainer>
        <Sidebar
          userInfo={userInfo}
          current={current}
          handleItemChange={handleItemChange}
          history={history}
          showConnect={showConnect}
          initialState="maker"
        />
        <div className="content">
          <Header
            info={loggedIn && userInfo !== null && userInfo}
            onConnect={this.onConnect}
            showConnect={showConnect}
            logo={logo}
          />

          <div className="container currency-container split">
            <EtheriumBox
              userInfo={userInfo}
              onPanelAction={this.onAction}
              showConnect={showConnect}
            />
            <DaiBox
              userInfo={userInfo}
              title={"DAI debt"}
              icon={Etherium}
              onPanelAction={this.onAction}
              showConnect={showConnect}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default observer(Dashboard)