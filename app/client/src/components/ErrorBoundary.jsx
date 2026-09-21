import { Component } from "react";

// Without this, any uncaught error in a single step component (a bad prop,
// a null lookup) unmounts the entire React tree and leaves a blank screen —
// no message, no way back. This catches it, shows a way out, and logs the
// real error to the console instead of just going dark.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("Caught by ErrorBoundary:", error, info.componentStack);
  }
  render() {
    if (this.state.error) {
      return (
        <div id="frame" className="frame">
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 40 }}>🫠</div>
            <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 18, color: "var(--text)" }}>
              That screen hit a snag.
            </div>
            <div style={{ fontFamily: "var(--body)", fontSize: 14, color: "var(--text-dim)", maxWidth: 280 }}>
              Nothing was lost. Your progress is saved. Tap below to go back home.
            </div>
            <button className="btn" style={{ maxWidth: 220 }} onClick={() => { this.setState({ error: null }); window.location.href = "/"; }}>
              Back to home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
